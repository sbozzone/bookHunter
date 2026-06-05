# Build Project Workflow

This workflow details the steps required to install dependencies and build the Next.js project.

## Steps

1. **Install Dependencies**
   Run the following command to install the project dependencies:
   ```bash
   npm install
   ```

2. **Typecheck**
   Verify TypeScript static types before building:
   ```bash
   npm run typecheck
   ```

3. **Build the Application**
   Compile the Next.js application for production:
   ```bash
   npm run build
   ```
