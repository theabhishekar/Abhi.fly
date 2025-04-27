# Flight Simulator with Streamlit

This project combines a 3D flight simulator built with Three.js and a Streamlit interface to provide a public URL for accessing the application.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher (Python 3.8-3.10 recommended for best compatibility)
- Node.js and npm (for the Three.js application)

### Installation

1. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

   If you encounter any issues with specific package versions, you can try installing without version constraints:
   ```
   pip install streamlit numpy pandas matplotlib
   ```

2. Install the required Node.js packages:
   ```
   npm install
   ```

### Running the Application

1. Start the Streamlit app:
   ```
   streamlit run app.py
   ```

   Or use the provided scripts:
   - Windows: `run_streamlit.bat`
   - macOS/Linux: `./run_streamlit.sh`

2. The Streamlit app will provide a public URL that you can share with others.

3. Click the "Launch Flight Simulator" button in the Streamlit interface to start the Three.js application.

## Features

- **Streamlit Interface**: Provides a user-friendly interface for launching and controlling the flight simulator.
- **Public URL**: Streamlit automatically generates a public URL that you can share with others.
- **Integration**: Seamlessly integrates the Three.js flight simulator with the Streamlit interface.

## Troubleshooting

- If you encounter any issues with the Node.js server, make sure it's running on port 3000.
- If the Streamlit app can't launch the flight simulator, check that the server.js file is in the correct location.
- If you have issues installing the Python dependencies, try upgrading pip first:
  ```
  python -m pip install --upgrade pip
  ```
- For Python version compatibility issues, try installing packages without version constraints:
  ```
  pip install streamlit numpy pandas matplotlib
  ```

## Additional Resources

- [Streamlit Documentation](https://docs.streamlit.io/)
- [Three.js Documentation](https://threejs.org/docs/) 