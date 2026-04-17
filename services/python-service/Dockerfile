FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r --no-cache-dir requirements.txt
COPY . .
EXPOSE 3002
ENTRYPOINT ["python", "app.py"]
