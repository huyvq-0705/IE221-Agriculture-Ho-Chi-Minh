# Django Installation & Setup Guide

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Virtual environment tool (recommended)

## Installation Steps

### 1. Create a Virtual Environment

```bash

# Create virtual environment
python -m venv django-env

# Activate virtual environment
# On Windows:
django-env\Scripts\activate
# On macOS/Linux:
source django-env/bin/activate
```

### 2. Install Django

```bash
# Install the latest stable version
pip install django

# Or install a specific version
pip install django==4.2

# Verify installation
python -m django --version
```

### 3. Initial Database Setup (Optional)

```bash
# Apply initial migrations
python manage.py migrate
```

### 4. Create a Superuser (Optional)

```bash
# Create admin user for Django admin interface
python manage.py createsuperuser
```

### 5. Run the Development Server

```bash
# Start the development server
python manage.py runserver

# Or specify a custom port
python manage.py runserver 8080
```

Visit `http://127.0.0.1:8000/` in your browser to see the Django welcome page.



## Configuration

### 1. Add Your App to Settings

Edit `myproject/settings.py` and add your app to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'myapp',  # Add your app here
]
```

### 2. Database Configuration

Django uses SQLite by default. To use a different database, modify the `DATABASES` setting in `settings.py`:

```python
# For PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydatabase',
        'USER': 'mydatabaseuser',
        'PASSWORD': 'mypassword',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}
```

## Common Commands

```bash
# Create migrations for model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Run tests
python manage.py test

# Open Django shell
python manage.py shell

# Check for issues
python manage.py check
```

## Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

Install `python-decouple` to use environment variables:

```bash
pip install python-decouple
```

Update `settings.py`:

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
```

## Requirements File

Create a `requirements.txt` file to track dependencies:

```bash
# Generate requirements file
pip freeze > requirements.txt

# Install from requirements file
pip install -r requirements.txt
```
