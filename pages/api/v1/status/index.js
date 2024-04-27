import database from "infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();

  const databaseVersionResult = await database.query("Show server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "show max_connections;",
  );

  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;
  /*
  const databaseOpenedConnectionsResult = await database.query(
    "SELECT * FROM pg_stat_activity WHERE datname = 'local_db';",
  );
   */
  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  console.log("Conexões abertas: " + databaseOpenedConnectionsValue);

  /*
    Existe um consenso que uma API em Rest não deve responder com
    chaves em lowerCamelCase, mas sim, no formato snake_case onde
    cada palavra deve ser separada por um underscore
  */
  response.status(200).json({
    updated_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      },
    },
  });
}

export default status;
