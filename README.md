# My Project
## Admin commands
| Command | Description |
|---------|-------------|
| /list | List all files |
| /read filename | Print file content |
| /upload name:content | Create a file |
| /delete filename | Delete a file |
| /download filename | Download a file |
| /search keyword | Search filenames |
| /info filename | File size + dates |

## Running multiple read clients
Change CLIENT_PORT and CLIENT_NAME per client:
- Client 2: PORT=41236
- Client 3: PORT=41237
- Client 4: PORT=41238

## HTTP monitor
Visit http://localhost:8080/stats for JSON stats.