"""
Celery configuration for The Sacred Empire.

This module configures Celery for background task processing.
"""

import os
from celery import Celery

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sacred_empire.settings')

app = Celery('sacred_empire')

# Load configuration from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery configuration."""
    print(f'Request: {self.request!r}')
