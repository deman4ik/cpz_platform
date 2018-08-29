FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY CPZMarketWatcher/*.csproj ./CPZMarketWatcher/
RUN dotnet restore

# copy everything else and build app
COPY CPZMarketWatcher/. ./CPZMarketWatcher/
WORKDIR /app/CPZMarketWatcher
RUN dotnet publish -c Release -o out


FROM microsoft/dotnet:2.1-aspnetcore-runtime AS runtime
WORKDIR /app
COPY --from=build /app/CPZMarketWatcher/out ./
ENTRYPOINT ["dotnet", "CPZMarketWatcher.dll"]