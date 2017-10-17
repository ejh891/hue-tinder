import React, { Component } from 'react';
import Color from 'color';
import FontAwesome from 'react-fontawesome';
import classNames from 'classnames';
import { Grid, Col, Row } from 'react-bootstrap';
import SwipeableViews from 'react-swipeable-views';

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
    this.help = this.help.bind(this);
    this.swiped = this.swiped.bind(this);
    this._updateDatabase = this._updateDatabase.bind(this);

    this.state = {
      prevAnswers: [],
      color: null,
      hueRepresentation: null,
      swipeableIndex: 1,
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

  swiped(index, latestIndex) {
    this.setState({ swipeableIndex: index}, () => {
      if (index === 0) {
        this.yep();
      } else if (index === 2) {
        this.nope();
      }
  
      this.setState({ swipeableIndex: 1 });
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

  help() {
    this.setState({ color: null });
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
            <Col xs={12} className="info">
              <h3 style={{color: "white"}}>Color Theme Tinder</h3>
            </Col>
          </Row>
          <Row style={{marginTop: "10px"}}>
            <Col xs={12}>
              <p>Does the big color on the left side match with the color palette on the right side?</p>
              <p>Examples:</p>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <div style={{textAlign: "center"}}>
                <FontAwesome name="check" style={{fontSize: "40px", color: "#04a34a"}} />
                <img className="sample-image" src="https://i.imgur.com/8f1zKnD.png?1" alt="Yep sample" />
              </div>
            </Col>
            <Col xs={6}>
              <div style={{textAlign: "center"}}>
                <FontAwesome name="times" style={{fontSize: "40px", color: "#d35452"}} />
                <img className="sample-image" src="https://i.imgur.com/mPZi3o4.png?1" alt="Nope sample" />
              </div>
            </Col>
          </Row>
          <Row style={{marginTop: "10px"}}>
            <Col xs={12}>
              <p>Hint: Watch out for black, white, and gray colors; those are usually "nopes"</p>
            </Col>
          </Row>
          <Row style={{marginTop: "10px"}}>
            <Col xs={12}>
              <button className={classNames("action-button", "info")} onClick={this.getNewColor}>Get Started</button>
            </Col>
          </Row>
        </Grid>
      )
    }
    return (
      <Grid>
        <Row>
          <Col className="padding-0" xs={6}>
            <button className={classNames("action-button", "info", {"disabled": this.state.prevAnswers.length === 0})} onClick={this.undo} disabled={this.state.prevAnswers.length === 0}><FontAwesome name="undo" size="2x" /></button>
          </Col>
          <Col className="padding-0" xs={6}>
            <button className={classNames("action-button", "info")} onClick={this.help}><FontAwesome name="question-circle" size="2x" /></button>
          </Col>
        </Row>
        <Row>
          <SwipeableViews
            key={this.state.swipeableKey}
            index={this.state.swipeableIndex}
            onChangeIndex={this.swiped}
          >
            <div>
              <Col className="padding-0" xs={12}>
                <div className="color-candidate" style={{backgroundColor: "#04a34a"}}>
                  <FontAwesome name="thumbs-up" size="4x" style={{paddingLeft: "35vw"}}/>
                </div>
              </Col>
            </div>
            <div>
              <Col className="padding-0" xs={6}>
                <div className="color-candidate" style={{backgroundColor: this.state.color.hex()}}></div>
              </Col>
              <Col className="padding-0" xs={6}>
                <div className="hue-candidate" style={{backgroundColor: Color({h: this.state.color.hue(), s: 40, l: 40 }).hex()}}></div>
                <div className="hue-candidate" style={{backgroundColor: Color({h: this.state.color.hue(), s: 50, l: 50 }).hex()}}></div>
                <div className="hue-candidate" style={{backgroundColor: Color({h: this.state.color.hue(), s: 60, l: 60 }).hex()}}></div>
                <div className="hue-candidate" style={{backgroundColor: Color({h: this.state.color.hue(), s: 70, l: 70 }).hex()}}></div>
                <div className="hue-candidate" style={{backgroundColor: Color({h: this.state.color.hue(), s: 80, l: 80 }).hex()}}></div>
                <div className="hue-candidate" style={{backgroundColor: Color({h: this.state.color.hue(), s: 90, l: 90 }).hex()}}></div>
              </Col>
            </div>
            <div>
              <Col className="padding-0" xs={12}>
                <div className="color-candidate" style={{backgroundColor: "#d35452"}}>
                  <FontAwesome name="thumbs-down" size="4x" style={{paddingRight: "35vw"}} />
                </div>
              </Col>
            </div>
          </SwipeableViews>
        </Row>
        <Row>
          <Col className="padding-0" xs={6}>
            <button className={classNames("action-button", "danger")} onClick={this.nope}><FontAwesome name="times" size="2x" /></button>
          </Col>
          <Col className="padding-0" xs={6}>
            <button className={classNames("action-button", "success")} onClick={this.yep}><FontAwesome name="check" size="2x" /></button>
          </Col>
        </Row>
      </Grid>

    );
  }
}

export default App;
