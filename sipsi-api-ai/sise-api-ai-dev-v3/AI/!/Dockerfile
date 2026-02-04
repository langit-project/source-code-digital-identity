# Use the official Python image from the Docker Hub
FROM python:3.8

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container at /app
COPY requirements.txt /app/

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libhdf5-dev \
    libhdf5-serial-dev \
    hdf5-tools \
    libssl-dev \
    libffi-dev \
    python3-dev \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    && apt-get clean

# Set the environment variables to increase pip timeout and use a faster mirror
ENV PIP_DEFAULT_TIMEOUT=100
ENV PIP_INDEX_URL=https://pypi.org/simple

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the models into the container
COPY db /app/db
COPY pretrainedModel /app/pretrainedModel
COPY NER-INDO /app/NER-INDO

# Copy the rest of the working directory contents into the container at /app
COPY . /app

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variable
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3001

# Run app.py when the container launches
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=3001"]
