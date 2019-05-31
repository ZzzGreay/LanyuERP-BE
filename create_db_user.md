```
db.createUser(
  {
    user: "lanyu",
    pwd: "Lares88!",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)

db.createUser(
  {
    user: "lanyu",
    pwd: "Lares88!",
    roles: [ { role: "readWrite", db: "lanyuerp" } ]
  }
)
```