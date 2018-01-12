import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import DataCoverageWidget from './components/DataCoverageWidget'

class App extends Component {
  render() {
    return (
      <div className="App">

        <header className="jumbotron">

          <h1 className="display-4">Data Coverage</h1>
        </header>
        <div className="container">
            <DataCoverageWidget />
        </div>
        
         <footer>
          <div className = "row bg-dark mt-5 pt-4 footer">
            <div className = "col-md-12 text-light">Feedback: <a href="mailto:hvikram@patsnap.com">hvikram@patsnap.com</a></div>
          </div>
          </footer>
      </div>
    );
  }
}

export default App;
