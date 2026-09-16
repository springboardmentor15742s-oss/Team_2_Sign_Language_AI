from pathlib import Path

import pandas as pd
import streamlit as st


# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------

st.set_page_config(
    page_title="SignSpeak AI Analytics",
    page_icon="🤟",
    layout="wide",
)

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "powerbi" / "data"


# ---------------------------------------------------------
# LOAD DATA
# ---------------------------------------------------------

model_df = pd.read_csv(
    DATA_DIR / "model_performance.csv"
)

history_df = pd.read_csv(
    DATA_DIR / "cnn_training_history.csv"
)

confusion_df = pd.read_csv(
    DATA_DIR / "sign_confusions.csv"
)

sign_df = pd.read_csv(
    DATA_DIR / "sign_performance.csv"
)

external_df = pd.read_csv(
    DATA_DIR / "external_predictions.csv"
)

learner_df = pd.read_csv(
    DATA_DIR / "learner_performance.csv"
)


# ---------------------------------------------------------
# TITLE
# ---------------------------------------------------------

st.title("🤟 SignSpeak AI — Analytics Dashboard")

st.caption(
    "Model Performance • CNN Training • Sign Recognition "
    "• Learning Intelligence"
)


# ---------------------------------------------------------
# KPI CARDS
# ---------------------------------------------------------

best_validation = model_df[
    "Validation Accuracy"
].max()

best_test = model_df[
    "Test Accuracy"
].max()

best_external = model_df[
    "External Accuracy"
].max()

total_classes = len(sign_df)


col1, col2, col3, col4 = st.columns(4)

col1.metric(
    "Best Validation Accuracy",
    f"{best_validation:.2f}%"
)

col2.metric(
    "Best Test Accuracy",
    f"{best_test:.2f}%"
)

col3.metric(
    "External Accuracy",
    f"{best_external:.2f}%"
)

col4.metric(
    "Recognized Classes",
    total_classes
)


st.divider()


# ---------------------------------------------------------
# MODEL PERFORMANCE
# ---------------------------------------------------------

st.subheader("📊 Model Performance Comparison")

performance_chart = (
    model_df[
        [
            "Model",
            "Validation Accuracy",
            "Test Accuracy",
            "External Accuracy",
        ]
    ]
    .set_index("Model")
)

st.bar_chart(performance_chart)


# ---------------------------------------------------------
# CNN TRAINING
# ---------------------------------------------------------

st.subheader("🧠 CNN Learning Progress")

accuracy_history = history_df[
    [
        "Epoch",
        "Training Accuracy",
        "Validation Accuracy",
    ]
].set_index("Epoch")

st.line_chart(accuracy_history)


col1, col2 = st.columns(2)


with col1:

    st.markdown("#### Training Loss")

    st.line_chart(
        history_df[
            [
                "Epoch",
                "Training Loss",
            ]
        ].set_index("Epoch")
    )


with col2:

    st.markdown("#### Validation Loss")

    st.line_chart(
        history_df[
            [
                "Epoch",
                "Validation Loss",
            ]
        ].set_index("Epoch")
    )


st.divider()


# ---------------------------------------------------------
# SIGN PERFORMANCE
# ---------------------------------------------------------

st.subheader("✋ Sign Recognition Performance")

sign_chart = (
    sign_df[
        [
            "Sign",
            "F1 Score",
        ]
    ]
    .sort_values(
        "F1 Score",
        ascending=False
    )
    .set_index("Sign")
)

st.bar_chart(sign_chart)


# ---------------------------------------------------------
# CONFUSION ANALYSIS
# ---------------------------------------------------------

st.subheader("⚠️ Most Confused Signs")

top_confusions = (
    confusion_df
    .sort_values(
        "Count",
        ascending=False
    )
    .head(10)
)

st.bar_chart(
    top_confusions[
        [
            "Confusion Pair",
            "Count",
        ]
    ].set_index(
        "Confusion Pair"
    )
)

st.dataframe(
    top_confusions,
    use_container_width=True,
    hide_index=True,
)


# ---------------------------------------------------------
# EXTERNAL TEST
# ---------------------------------------------------------

st.subheader("🌍 Real-World External Image Test")

correct_count = int(
    external_df["Correct"].sum()
)

total_external = len(
    external_df
)

external_accuracy = (
    correct_count /
    total_external *
    100
    if total_external
    else 0
)


col1, col2, col3 = st.columns(3)

col1.metric(
    "External Images",
    total_external
)

col2.metric(
    "Correct Predictions",
    correct_count
)

col3.metric(
    "Real-World Accuracy",
    f"{external_accuracy:.2f}%"
)


st.dataframe(
    external_df,
    use_container_width=True,
    hide_index=True,
)


st.info(
    "The difference between test-set accuracy and external-image "
    "accuracy indicates dataset/domain shift. Additional real-world "
    "training data and augmentation can improve generalization."
)


st.divider()


# ---------------------------------------------------------
# LEARNER INTELLIGENCE
# ---------------------------------------------------------

st.subheader("🎯 Learner Performance Intelligence")

learner_chart = (
    learner_df[
        [
            "Sign",
            "Learner Accuracy",
        ]
    ]
    .set_index("Sign")
)

st.bar_chart(
    learner_chart
)


priority = learner_df[
    learner_df["Learning Status"] == "Priority"
]

strong = learner_df[
    learner_df["Learning Status"] == "Strong"
]


col1, col2 = st.columns(2)


with col1:

    st.markdown("#### 🔶 Priority Signs")

    if len(priority):

        st.write(
            ", ".join(
                priority["Sign"].astype(str)
            )
        )

    else:

        st.write("No priority signs")


with col2:

    st.markdown("#### ✅ Strong Signs")

    if len(strong):

        st.write(
            ", ".join(
                strong["Sign"].astype(str)
            )
        )

    else:

        st.write("No strong signs")


st.dataframe(
    learner_df,
    use_container_width=True,
    hide_index=True,
)


# ---------------------------------------------------------
# LEARNING RECOMMENDATION
# ---------------------------------------------------------

st.subheader("✨ AI Learning Recommendation")

if len(priority):

    priority_signs = ", ".join(
        priority["Sign"].astype(str)
    )

    st.success(
        f"Focus the next practice session on "
        f"{priority_signs}. Review visually similar signs "
        f"and repeat recognition exercises."
    )

else:

    st.success(
        "Performance is strong. Continue with mixed-sign "
        "practice and advanced assessments."
    )


# ---------------------------------------------------------
# FOOTER
# ---------------------------------------------------------

st.divider()

st.caption(
    "SignSpeak AI • Model Analytics & Learning Intelligence"
)