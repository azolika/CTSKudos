# Database Management Tool

This directory contains `manage_db.py`, a unified command-line utility for managing the Kudos application database.

## Usage

Run the script using Python from the project root:

```powershell
python db_scripts/manage_db.py [command] [options]
```

### Available Commands

| Command | Description |
| :--- | :--- |
| `init` | **Initialize Database**: Creates all tables and imports initial data from `config_generated.json` if the database is empty. |
| `fix-admin` | **Reset Admin**: Ensures the admin user (`admin@cargotrack.ro`) exists and resets its password to the default (`Cargo2025!@#`). |
| `clear-feedback` | **Delete All Feedback**: Truncates the feedback table. This is a destructive action. |

## Initial Data Setup

The `init` command can bulk-import users and hierarchy from a file named `config_generated.json` in the project root. 

A template for this file is provided:
*   **Template**: `db_scripts/config_generated.json.example`

To use it:
1. Copy the example to the root: `cp db_scripts/config_generated.json.example ./config_generated.json`
2. Update the usernames, names, and roles as needed.
3. Run `python db_scripts/manage_db.py init`.

### Options

*   `--noprompt`: Use this with the `clear-feedback` command to skip the confirmation prompt (useful for automation/scripts).

## Examples

**Initialize a fresh database:**
```powershell
python db_scripts/manage_db.py init
```

**Recover admin access:**
```powershell
python db_scripts/manage_db.py fix-admin
```

**Clear all feedback (with confirmation):**
```powershell
python db_scripts/manage_db.py clear-feedback
```

**Clear all feedback (no prompt):**
```powershell
python db_scripts/manage_db.py clear-feedback --noprompt
```
