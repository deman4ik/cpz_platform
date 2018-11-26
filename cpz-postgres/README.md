# CPZ-Posgtes

**Cryptuoso Database API Service**

* Database: [Azure for PostreSQL](https://docs.microsoft.com/en-us/azure/postgresql/overview)
* API: [Hasura GraphQL](https://hasura.io/)

---
## Environments
### Dev:

```yaml
# PosgtreSQL Host:
cpz-dev.postgres.database.azure.com:5432/postgres?ssl=true
# GraphQL Endpoint:
https://cpz-hasura-dev.azurewebsites.net/v1alpha1/graphql
```
### (!!! Not available now) Stage:

```yaml
# PosgtreSQL Host:
cpz-stage.postgres.database.azure.com:5432/postgres?ssl=true
# GraphQL Endpoint:
https://cpz-hasura-stage.azurewebsites.net/v1alpha1/graphql
```


### (!!! Not available now) Prod:

```yaml
# PosgtreSQL Host:
cpz-prod.postgres.database.azure.com:5432/postgres?ssl=true
# GraphQL Endpoint:
https://cpz-hasura-prod.azurewebsites.net/v1alpha1/graphql
```
---

### Migrations
[Hasura Migrations Docs](https://docs.hasura.io/1.0/graphql/manual/migrations/index.html)

**Database development oder:**
1. Creating or modifying schema in dev environment
2. Executing automated tests
3. Migrating schema changes to dev environment
4. QA testing
5. Migrating schema changes to prod environment

**Example dev -> stage migrations** 
1. Configure dev environment in `./config.yaml` file.
    
    Dev:
    ```yaml
    endpoint: https://cpz-hasura-dev.azurewebsites.net
    ```
2. Open Hasura console
    ```
    cd cpz-postgres
    hasura console --access-key mysecretkey
    ```
3. Modify schema structure
4. Configure another environment in `./config.yaml` file.
   
    Stage (!!! Not available now):
    ```yaml
    endpoint: https://cpz-hasura-stage.azurewebsites.net
    ```
5. Apply migration    
    ```
    hasura migrate apply
    ```