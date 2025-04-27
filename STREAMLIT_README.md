# Flight Simulator with Streamlit

This project combines a 3D flight simulator built with Three.js and a Streamlit interface to provide a public URL for accessing the application.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js and npm (for the Three.js application)

### Installation

1. Install the required Python packages:
   ```
   pip install -r requirements.txt
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

2. The Streamlit app will provide a public URL that you can share with others.

3. Click the "Launch Flight Simulator" button in the Streamlit interface to start the Three.js application.

## Features

- **Streamlit Interface**: Provides a user-friendly interface for launching and controlling the flight simulator.
- **Public URL**: Streamlit automatically generates a public URL that you can share with others.
- **Integration**: Seamlessly integrates the Three.js flight simulator with the Streamlit interface.

## Troubleshooting

- If you encounter any issues with the Node.js server, make sure it's running on port 3000.
- If the Streamlit app can't launch the flight simulator, check that the server.js file is in the correct location.

## Additional Resources

- [Streamlit Documentation](https://docs.streamlit.io/)
- [Three.js Documentation](https://threejs.org/docs/) 