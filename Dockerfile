FROM ubuntu:latest
LABEL authors="irisp"
ENTRYPOINT ["top", "-b"]

# Используем официальный образ Node.js в качестве базового образа
FROM node:14

RUN apt-get update && apt-get install -y postgresql-client

# Устанавливаем переменную среды для указания рабочей директории в контейнере
WORKDIR /api-test

# Копируем package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта в рабочую директорию
COPY . .

# Добавляем переменные окружения для подключения к базе данных PostgreSQL
ENV PGHOST=localhost
ENV PGUSER=postgres
ENV PGPASSWORD=2121
ENV PGDATABASE=measur
ENV PGPORT=5432

# Указываем порт, который будет слушать приложение
EXPOSE 3000

# Команда для запуска приложения
CMD [ "node", "server.js" ]
