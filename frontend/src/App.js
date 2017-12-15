import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import DataCoverageWidget from './components/DataCoverageWidget'

class App extends Component {
  render() {
    return (
      <div className="App">

        <header className="jumbotron">

          <h1 className="display-3">Data Coverage</h1>
        </header>
        <div className="container">
            <DataCoverageWidget />
        </div>
        
      </div>
    );
  }
}

export default App;
