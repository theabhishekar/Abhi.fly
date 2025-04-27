import streamlit as st
import os
import webbrowser
import subprocess
import time
import signal
import sys

# Set page configuration
st.set_page_config(
    page_title="Flight Simulator",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Main title
st.title("Flight Simulator")
st.markdown("---")

# Sidebar
with st.sidebar:
    st.header("Controls")
    st.markdown("""
    - **Arrow Keys**: Control the aircraft
    - **W/S**: Adjust thrust
    - **Space**: Fire weapons
    - **R**: Reload
    """)
    
    st.header("About")
    st.markdown("""
    This is a 3D flight simulator built with Three.js and enhanced with Streamlit.
    Use the controls to fly the aircraft and explore the world.
    """)

# Main content
col1, col2 = st.columns([2, 1])

with col1:
    st.header("Flight Simulator")
    st.markdown("""
    Welcome to the Flight Simulator! This application allows you to control a 3D aircraft
    in a virtual environment. Use the controls listed in the sidebar to navigate.
    """)
    
    # Add a button to launch the game
    if st.button("Launch Flight Simulator"):
        st.info("Launching the Flight Simulator...")
        
        # Start the Node.js server
        try:
            # Use subprocess to start the server
            server_process = subprocess.Popen(["node", "server.js"], 
                                             stdout=subprocess.PIPE, 
                                             stderr=subprocess.PIPE)
            
            # Wait a moment for the server to start
            time.sleep(2)
            
            # Open the game in a new browser tab
            webbrowser.open("http://localhost:3000")
            
            st.success("Flight Simulator launched successfully!")
            st.info("The game is running at http://localhost:3000")
            
        except Exception as e:
            st.error(f"Error launching the Flight Simulator: {str(e)}")

with col2:
    st.header("Statistics")
    st.markdown("""
    - **Aircraft Speed**: Variable
    - **Altitude**: Variable
    - **Health**: 100%
    - **Ammo**: 100
    """)
    
    # Add a chart or visualization
    st.subheader("Performance Metrics")
    st.line_chart({"Speed": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]})

# Footer
st.markdown("---")
st.markdown("Flight Simulator | Created with Three.js and Streamlit") 