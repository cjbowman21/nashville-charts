# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY src/NashvilleCharts.Web/ClientApp/package*.json ./
RUN npm install
COPY src/NashvilleCharts.Web/ClientApp/ ./
RUN npm run build

# Stage 2: Build .NET application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app

# Copy solution and project files
COPY NashvilleCharts.sln ./
COPY src/NashvilleCharts.Core/NashvilleCharts.Core.csproj ./src/NashvilleCharts.Core/
COPY src/NashvilleCharts.Infrastructure/NashvilleCharts.Infrastructure.csproj ./src/NashvilleCharts.Infrastructure/
COPY src/NashvilleCharts.Web/NashvilleCharts.Web.csproj ./src/NashvilleCharts.Web/

# Restore dependencies
RUN dotnet restore src/NashvilleCharts.Web/NashvilleCharts.Web.csproj

# Copy source code
COPY src/ ./src/

# Copy React build output to wwwroot
COPY --from=frontend-build /app/frontend/dist ./src/NashvilleCharts.Web/wwwroot/

# Publish application
RUN dotnet publish src/NashvilleCharts.Web/NashvilleCharts.Web.csproj -c Release -o /app/publish

# Stage 3: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy published app
COPY --from=backend-build /app/publish .

# Configure for Railway
ENV ASPNETCORE_URLS=http://+:$PORT
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port (Railway will override with $PORT)
EXPOSE 8080

# Run the application
ENTRYPOINT ["dotnet", "NashvilleCharts.Web.dll"]
