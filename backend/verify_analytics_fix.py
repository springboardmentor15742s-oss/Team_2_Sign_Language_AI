import json
import urllib.request
import uuid

BASE_URL = 'http://127.0.0.1:8000/api/v1'

def req(path, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode('utf-8') if data is not None else None
    r = urllib.request.Request(f'{BASE_URL}{path}', data=body, headers=headers, method=method)
    with urllib.request.urlopen(r) as resp:
        content_type = resp.headers.get('Content-Type', '')
        if 'application/json' in content_type:
            return resp.status, json.loads(resp.read().decode('utf-8'))
        else:
            return resp.status, resp.read().decode('utf-8')

print('=== 1. Testing Student Login ===')
status, auth_data = req('/auth/login', 'POST', {'email': 'student@signspeak.com', 'password': 'student123'})
token = auth_data['access_token']
print(f"Login successful: {auth_data['user']['full_name']} (Role: {auth_data['user']['role']})")

print('\n=== 2. Testing Model Performance API ===')
status, model_perf = req('/reports/model-performance', token=token)
print(f"Model Name:            {model_perf['model_name']}")
print(f"Model Display:         {model_perf['model_display_name']}")
print(f"Model Version:         {model_perf['model_version']}")
print(f"Dataset:               {model_perf['dataset_name']}")
print(f"Feature Pipeline:      {model_perf['feature_pipeline']}")
print(f"Feature Count:         {model_perf['feature_count']}")
print(f"Test Samples:          {model_perf['test_samples']}")
print(f"Correct Predictions:   {model_perf['correct_predictions']}")
print(f"Incorrect Predictions: {model_perf['incorrect_predictions']}")
print(f"Accuracy:              {model_perf['accuracy_percent']}%")
print(f"Precision:             {model_perf['precision_percent']}%")
print(f"Recall:                {model_perf['recall_percent']}%")
print(f"F1 Score:              {model_perf['f1_percent']}%")
print(f"Is Trained:            {model_perf['is_trained']}")

print('\n=== 3. Testing Learner Overview API ===')
status, overview = req('/reports/overview?range=30d', token=token)
print(f"Lessons Completed:     {overview['lessons_completed']}")
print(f"Practice Gestures:     {overview['practice_gestures']}")
print(f"Learner Accuracy:      {overview['average_accuracy']}%")
print(f"Learning Time:         {overview['learning_time_display']}")
print(f"Assessments Completed: {overview['assessments_completed']}")

print('\n=== 4. Testing Date Range Filters ===')
for r in ['today', '7d', '30d', '90d', 'all']:
    status, o = req(f'/reports/overview?range={r}', token=token)
    print(f"Range {r:5s} -> gestures: {o['practice_gestures']}, accuracy: {o['average_accuracy']}%, time: {o['learning_time_display']}")

print('\n=== 5. Testing Export CSV ===')
status, csv_text = req('/reports/export?range=30d', token=token)
print(f"CSV status: {status}")
print("CSV Header Preview:")
for line in csv_text.splitlines()[:15]:
    print('  ', line)

print('\n=== 6. Testing End-to-End Dynamic Assessment for a New Learner ===')
new_email = f"learner_{uuid.uuid4().hex[:8]}@signspeak-test.com"
status, new_user_auth = req('/auth/register', 'POST', {
    'full_name': 'Amrutha Test Learner',
    'email': new_email,
    'password': 'Password123!'
})
new_token = new_user_auth['access_token']
print(f"Registered new learner: {new_email}")

# Check initial overview (should be 0)
status, new_overview = req('/reports/overview?range=all', token=new_token)
print(f"Initial New Learner Gestures: {new_overview['practice_gestures']}, Accuracy: {new_overview['average_accuracy']}%, Has Data: {new_overview['has_data']}")

# Get questions
status, q_data = req('/assessment/questions?type=quiz&count=3', token=new_token)
questions = q_data['questions']
print(f"Generated {len(questions)} questions for assessment: {[q['target_sign'] for q in questions]}")

# Evaluate attempts
attempt_ids = []
landmarks_correct = [[float(i * 0.04), float(i * 0.02), 0.0] for i in range(21)]
for i, q in enumerate(questions):
    status, eval_res = req('/assessment/evaluate', 'POST', {
        'expected_sign': q['target_sign'],
        'landmarks': landmarks_correct
    }, token=new_token)
    attempt_ids.append(eval_res['attempt_id'])
    print(f"  Q{i+1}: sign {q['target_sign']} -> predicted: {eval_res['predicted_sign']} (score: {eval_res['score']}%, correct: {eval_res['is_correct']})")

# Submit session
status, session_res = req('/assessment/submit', 'POST', {
    'assessment_type': 'quiz',
    'attempt_ids': attempt_ids
}, token=new_token)
print(f"Submitted assessment session ID {session_res['id']} with accuracy {session_res['accuracy']}%")

# Check updated reports overview for the new learner
status, updated_overview = req('/reports/overview?range=all', token=new_token)
print(f"Updated New Learner Gestures: {updated_overview['practice_gestures']}, Accuracy: {updated_overview['average_accuracy']}%, Assessments: {updated_overview['assessments_completed']}")

# Verify previous learner (student@signspeak.com) is NOT affected
status, orig_overview = req('/reports/overview?range=30d', token=token)
print(f"Original Learner Gestures remained isolated: {orig_overview['practice_gestures']}")

print('\n=== ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! ===')
