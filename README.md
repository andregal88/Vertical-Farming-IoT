# Agrisense Dashboard

This is a Next.js project for the Agrisense Dashboard, a vertical farming management system.

# README - Setup Instructions

(Everything is placed in VerticalFarmingManagementApp Folder)

## 1. Database Setup

1. **Import the Database Dump**:
   - Use the provided `DB_dump` file and import it into your MySQL database.
   - You can do this by running the `.sql` file in MySQL Workbench or using a command line tool.

---

## 2. Open the Project in Visual Studio Code

1. **Open the Folder**:
   - Launch **Visual Studio Code**.
   - Open the `SITE` folder in Visual Studio Code.

---

## 3. (Optional) Generate and Send Data to Fiware

1. **Navigate to the Data Generation Subfolder**:
   - Go to the subfolder `dataToFiwareStore`.

2. **Configure MySQL Connection**:
   - Open the script and update the MySQL connection details with your own database credentials.

3. **Run the Data Generation Script**:
   - Run the script `dataGenAndSendToFiware` to generate and send data.

4. **Postman Setup**:
   - Open **Postman**.
   - Use the **POST** method with the following URL:
     ```
     http://127.0.0.1:5050/update_shelves
     ```
   - In the **Body** tab, use the following JSON:
     ```json
     {
         "shelve_ids": ["All"]
     }
     ```

5. **Send Data**:
   - After the above, use the following URL in **POST** method:
     ```
     http://127.0.0.1:5050/start_update
     ```
   - Hit **Send** to generate and send the data.

---

## 4. Run the Fiware to MySQL Script

1. **Navigate to the Fiware Subfolder**:
   - Go to the subfolder where you have the script `fiwareToMySQL`.

2. **Configure MySQL Connection**:
   - Open the script and update the MySQL connection details with your own database credentials.

3. **Run the Script**:
   - Execute the `fiwareToMySQL` script to insert the generated data into your MySQL database.

4. **User Interface**:
   - Write yes on terminal and press Enter.

---

## 5. Backend Setup

1. **Navigate to the Backend Folder**:
   - Go to the subfolder `BACKEND`, specifically the `newEndpoints` subfolder.

2. **Run Each Endpoint**:
   - In separate terminals, run each endpoint listed in this folder.

3. **Configure MySQL Connection**:
   - Ensure that you configure the MySQL connection details for each endpoint based on your own MySQL setup.

---

## 6. Frontend Setup

1. **Open Frontend Subfolder**:
   - Right-click on the `Frontend` subfolder and select **Open in Integrated Terminal**.

2. **Set Execution Policy**:
   - In the terminal, type the following command to bypass the execution policy:
     ```
     Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
     ```

3. **Install Dependencies**:
   - Run the following command to install the required packages:
     ```
     npm install --force
     ```

4. **Start the Development Server**:
   - Run the development server with the following command:
     ```
     npm run dev
     ```

---

## 7. Access the Application

1. **Access the Application in Browser**:
   - Once the server is running, you will see an output like this:
     ```
     Local:        http://localhost:3000
     ```
   - Press **Ctrl + Left Click** on the URL to open it in your browser.

---

### Done!

You should now have the system up and running. Enjoy using the application!


## Project Structure

The project structure is as follows:

```
.next/
app/
components/
hooks/
lib/
public/
styles/
```

- **app/**: Contains the main application code, including pages and components.
- **components/**: Reusable UI components.
- **hooks/**: Custom React hooks.
- **lib/**: Utility functions and libraries.
- **public/**: Static assets like images and fonts.
- **styles/**: Global styles and CSS files.

## Configuration

- **next.config.mjs**: Next.js configuration file.
- **tailwind.config.js**: Tailwind CSS configuration file.
- **tsconfig.json**: TypeScript configuration file.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs the linter.
