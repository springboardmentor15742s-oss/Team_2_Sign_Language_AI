import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union

from app.ml.evaluation.evaluator import EvaluationReport
from app.ml.dataset.config import DEFAULT_REPORT_PATH

logger = logging.getLogger(__name__)


class ReportManager:
    """
    Saves and loads evaluation reports to/from JSON files.
    """

    @staticmethod
    def save_report(report: EvaluationReport, path: Optional[Union[str, Path]] = None) -> bool:
        save_path = Path(path) if path else DEFAULT_REPORT_PATH
        try:
            save_path.parent.mkdir(parents=True, exist_ok=True)
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(report.to_dict(), f, indent=2)
            logger.info(f"Evaluation report saved to {save_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save report: {e}")
            return False

    @staticmethod
    def load_report(path: Optional[Union[str, Path]] = None) -> Optional[Dict[str, Any]]:
        load_path = Path(path) if path else DEFAULT_REPORT_PATH
        if not load_path.exists():
            logger.warning(f"Report file {load_path} does not exist.")
            return None

        try:
            with open(load_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data
        except Exception as e:
            logger.error(f"Failed to load report: {e}")
            return None
