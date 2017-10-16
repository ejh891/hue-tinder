import React, { Component } from 'react';
import Color from 'color';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';
import { Grid, Col, Row } from 'react-bootstrap';

import { firebaseDatabase } from '../config/firebase';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.getRandomInt = this.getRandomInt.bind(this);
    this.getNewColor = this.getNewColor.bind(this);
    this.getHueRepresentation = this.getHueRepresentation.bind(this);
    this.nope = this.nope.bind(this);
    this.yep = this.yep.bind(this);
    this.undo = this.undo.bind(this);
    this._updateDatabase = this._updateDatabase.bind(this);

    this.state = {
      prevAnswers: [],
      color: null,
      hueRepresentation: null,
    };
  }

  getRandomInt({ min, max }) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getHueRepresentation() {
    return new Color({ h: this.state.color.hue(), s: 50, l: 50 });
  }

  getNewColor() {
    const r = this.getRandomInt({ min: 0, max: 255 });
    const g = this.getRandomInt({ min: 0, max: 255 });
    const b = this.getRandomInt({ min: 0, max: 255 });

    const color = new Color({ r, g, b });

    this.setState({ 
      color,
    });
  }

  nope() {
    this._updateDatabase({ color: this.state.color, nopesToAdd: 1});

    this.setState((prevState) => {
      return {
        prevAnswers: [...prevState.prevAnswers, { color: this.state.color, answer: false }]
      }
    });

    this.getNewColor();
  }

  yep() {
    this._updateDatabase({ color: this.state.color, yepsToAdd: 1});

    this.setState((prevState) => {
      return {
        prevAnswers: [...prevState.prevAnswers, { color: this.state.color, answer: true }]
      }
    });

    this.getNewColor();
  }

  undo() {
    const prevAnswer = this.state.prevAnswers[this.state.prevAnswers.length - 1];

    if (prevAnswer.answer === true) {
      this._updateDatabase({ color: prevAnswer.color, yepsToAdd: -1 });
    } else {
      this._updateDatabase({ color: prevAnswer.color, nopesToAdd: -1 });
    }

    this.setState((prevState) => {
      return {
        prevAnswers: prevState.prevAnswers.slice(0, -1), // remove last element
        color: prevAnswer.color
      }
    });

  }

  _updateDatabase({ color, yepsToAdd = 0, nopesToAdd = 0 }) {
    const colorKey = color.hex().replace('#', '');
    const firebaseRef = firebaseDatabase().ref(`colors/${colorKey}`);

    firebaseRef.transaction(function(existingState) {
      const yeps = existingState ? existingState.yeps + yepsToAdd : yepsToAdd;
      const nopes = existingState ? existingState.nopes + nopesToAdd : nopesToAdd;

      return { yeps, nopes }
    });
  }

  render() {
    if (!this.state.color) {
      return (
        <Grid>
          <Row>
            <Col xs={12}>
              <p>On the next screen you'll be presented with two colors side-by-side. On the left is random color, and on the right is another color with the same Hue.</p>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <strong>Your job is to answer the question: do these colors look similar?</strong>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div>Hints:</div>
              <ul>
                <li>Most pairs will be similar, so don't worry if you find yourself tapping the green button a lot</li>
                <li>There's an undo button</li>
                <li>Keep an eye out for colors that are very close to black, white, or grey - those should often be "noped"</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <button className={classNames("action-button", "begin")} onClick={this.getNewColor}>Get Started</button>
            </Col>
          </Row>
        </Grid>
      )
    }
    return (
      <Grid>
        <Row>
          <Col className="padding-0" xs={6}>
            <button className={classNames("action-button", "undo", {"disabled": this.state.prevAnswers.length === 0})} onClick={this.undo} disabled={this.state.prevAnswers.length === 0}><FontAwesome name="undo" size="2x" /></button>
          </Col>
        </Row>
        <Row>
          <Col className="padding-0" xs={6}>
            <div className="color-candidate" style={{backgroundColor: this.state.color.hex()}}></div>
          </Col>
          <Col className="padding-0" xs={6}>
            <div className="color-candidate" style={{backgroundColor: this.getHueRepresentation()}}></div>
          </Col>
        </Row>
        <Row>
          <Col className="padding-0" xs={6}>
            <button className={classNames("action-button", "nope")} onClick={this.nope}><FontAwesome name="times" size="2x" /></button>
          </Col>
          <Col className="padding-0" xs={6}>
            <button className={classNames("action-button", "yep")} onClick={this.yep}><FontAwesome name="check" size="2x" /></button>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
