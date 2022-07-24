import { MongoMigration } from './db'
import { ProvinceMigration } from './province'

const migrationTasks = [
    ProvinceMigration,
    MongoMigration,
]

export { migrationTasks }
