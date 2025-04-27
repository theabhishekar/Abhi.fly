import subprocess
import sys
import os
import time
import webbrowser

def check_dependencies():
    """Check if all required dependencies are installed."""
    try:
        import streamlit
        import numpy
        import pandas
        import matplotlib
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        return True

def run_streamlit():
    """Run the Streamlit app and get the public URL."""
    print("Starting Streamlit app...")
    
    # Run Streamlit with the --server.address=0.0.0.0 flag to make it accessible from other devices
    # and the --server.port=8501 flag to specify the port
    process = subprocess.Popen(
        ["streamlit", "run", "app.py", "--server.address=0.0.0.0", "--server.port=8501"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for the Streamlit app to start
    time.sleep(3)
    
    # Get the local URL
    local_url = "http://localhost:8501"
    print(f"\nStreamlit app is running at: {local_url}")
    
    # Get the public URL (Streamlit will display this in the terminal)
    print("\nWaiting for Streamlit to generate a public URL...")
    print("This may take a few moments.")
    print("Once the URL is available, it will be displayed in the terminal.")
    print("You can also find it in the Streamlit interface.")
    
    # Open the local URL in the browser
    webbrowser.open(local_url)
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Streamlit app...")
        process.terminate()
        print("Streamlit app stopped.")

if __name__ == "__main__":
    if check_dependencies():
        run_streamlit()
    else:
        print("Failed to install dependencies. Please check your internet connection and try again.") 