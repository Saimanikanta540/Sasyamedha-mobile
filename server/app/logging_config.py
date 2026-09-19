import json
import logging
import sys
import time


class JsonFormatter(logging.Formatter):
    """Structured JSON logs (NFR-15) — enough for a hackathon-scale deployment
    without a full observability stack. Every record is one JSON line, so any
    log drain (Render/Railway/Fly all capture stdout) can be grep'd or shipped
    as-is."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Structured extras passed via logger.info("...", extra={"event": ..., ...})
        for key, value in record.__dict__.items():
            if key in ("args", "msg", "levelname", "levelno", "pathname", "filename",
                       "module", "exc_info", "exc_text", "stack_info", "lineno",
                       "funcName", "created", "msecs", "relativeCreated", "thread",
                       "threadName", "processName", "process", "name", "taskName"):
                continue
            payload[key] = value
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(level: int = logging.INFO) -> None:
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
