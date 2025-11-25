FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# system deps for common build tools and Pillow if image handling required
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential libpq-dev curl git netcat \
 && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Copy project files
COPY . /app

# Ensure static collection into collected static folder (if env set later)
ENV PORT=8000

# Expose port for Fly
EXPOSE 8000

# Collect static and run migrations at container start (entrypoint will run these commands)
CMD ["/bin/sh", "-c", "python manage.py migrate --noinput || true; python manage.py collectstatic --noinput || true; gunicorn altruria_project.wsgi:application -b 0.0.0.0:8000 --workers 3"]
