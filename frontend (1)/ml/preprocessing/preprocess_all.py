"""Run all preprocessing pipelines."""
import subprocess
import sys

scripts = [
    "ml/preprocessing/preprocess_asl_alphabet.py",
    "ml/preprocessing/preprocess_sign_mnist.py",
    "ml/preprocessing/preprocess_wlasl.py",
    "ml/preprocessing/preprocess_rwth_phoenix.py",
]

def main():
    for script in scripts:
        print(f"\n{'='*60}\nRunning: {script}\n{'='*60}")
        subprocess.run([sys.executable, script])

if __name__ == "__main__":
    main()
