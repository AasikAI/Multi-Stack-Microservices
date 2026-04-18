FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install requirements.txt
COPY . .
EXPOSE 3002
ENTRYPOINT ["python", "app.py"]
