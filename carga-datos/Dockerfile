FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache gcc musl-dev postgresql-dev curl

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "python-checker.py"]