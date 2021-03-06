'use babel';
import BreadCrumbs from './breadcrumbs';
import { CompositeDisposable } from 'atom';
import CrumbComments from './crumbComments';
// import $ from 'jQuery'

export default class BottomBarView {

  constructor(serializedState, currentVal, newVal) {

    // console.log(BreadCrumbs.updateBar())

    // this.subscriptions = new CompositeDisposable();
    //
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'bottomBar-View:createRecListener': (event) => this.createRecListener()
    // }));
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'bottomBar-View:mouseDown': (event) => this.mouseDown()
    // }));
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'bottomBar-View:mouseUp': (event) => this.mouseUp()
    // }));
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'bottomBar-View:seamless': (event) => this.seamless()
    // }));
    // this.subscriptions.add(atom.commands.add('atom-workspace', {
    //   'breadcrumbs:currentVal': () => this.currentVal()
    // }));

    currentVal = null;
    newVal = null;
    maxVal = null;

    startVal = this.checkUndoBufferLength1();

    // sets up the conditions for the elements to append to.
    this.element = document.createElement('div');
    this.element.classList.add('bottom-slide');


    // start event listeners ????
    this.element.addEventListener("mousedown", (event) => {
      this.mouseDown(event);
      // this.createRecListener()
    });

    this.element.addEventListener("mouseup", (event) => {
      this.mouseUp(event);
    })

    // Create event listener for seamless change in displayed value
    this.element.addEventListener("input", (event) => {
      // console.log("startVal: " + startVal)
      this.seamless(event)
    });

    // test the bar
    let bottomBarSlider = document.createElement('input');
    bottomBarSlider.classList.add('input-range');
    bottomBarSlider.id = 'bottomSlideBar';
    bottomBarSlider.type = 'range';
    bottomBarSlider.min = 0;
    bottomBarSlider.max = this.checkUndoBufferLength1();
    bottomBarSlider.step = 1;
    bottomBarSlider.value = bottomBarSlider.max;
    this.element.appendChild(bottomBarSlider);

    bottomBarLabel = document.createElement('div');
    bottomBarLabel.id = "slideVal2"
    bottomBarLabel.textContent = bottomBarSlider.value;
    this.element.appendChild(bottomBarLabel);

    this.crumbComments = new CrumbComments
  } // object stops here


  createRecListener() {
    let recBtn = document.getElementById('recordToggleBtn')
    recBtn.addEventListener("click", (event) => {
      // console.log("in the rec click")
      this.mouseDown(event);
    });
  }

  // begin functions for the slide bar

  // add new function for seemless change in value.
  seamless(event) {
    this.changeValue()
    // startVal = document.getElementById('slideVal2').innerHTML
    // console.log("startVal: " + startVal)
    let firstNo = startVal
    // console.log('firstNo: ' + firstNo)
    let nextNo = this.currentValue()
    // console.log('nextNo: ' + nextNo)
    // this.getCommentsForRange(firstNo, nextNo)
    this.numberOfChanges(firstNo, nextNo)
  }

  // mousedown function is used for git functions.
  mouseDown(event) {
    startingPoint = parseInt(this.currentValue())
    // console.log("START: " + startingPoint)

    // console.log('in the mouse down');
    this.element.max = this.checkUndoBufferLength1();
    // this.callRecordOn()
    // BreadCrumbs.gitCheckback()
    // BreadCrumbs.gitCheckout();
  }

  mouseUp(event) {
    // console.log(this.crumbComments.syncRead())
    endingPoint = parseInt(this.currentValue())
    // console.log("END: " + endingPoint)
    if (this.crumbComments.syncRead() !== undefined) {
      let range = this.getCommentsForRange(startingPoint, endingPoint)
      range.forEach( (barVal) => {
        this.crumbComments.parseComments(barVal)
      })
    }
  }

  getCommentsForRange(start, end) {
    let rangeArray = new Array

    if (start > end) {
      for (start; start >= end; start--) {
        rangeArray.push(start)
      }
    } else {
      for (start; start <= end; start++) {
        rangeArray.push(start)
      }
    }
    return rangeArray
  }

  currentValue() {
    // console.log("currentValue Function")
    let currentVal = document.getElementById('bottomSlideBar').value
    // console.log('currentval: ' + currentVal)
    return currentVal
  }
  // assigned variable currentVal.

  // changed display value to equal the location of the new point in the bar.
  changeValue() {
    let self = this;
    let newVal = (document.getElementById('slideVal2').innerHTML = this.currentValue());
    // console.log("inner html: " + newVal)
    // this.numberOfChanges()
  }

  checkUndoBufferLength1() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor === undefined) {
      maxVal = 0
      return 0
    } else {
      maxVal = editor.buffer.history.undoStack.length;
      return maxVal;
      if (__guard__(__guard__(editor, edit => edit.buffer), buff => buff.history) != null) {
        return editor.buffer.history.undoStack.length;
      }
    }
  }
  updateBar() {
    // console.log(this.bottomBarView.element)
    this.element.childNodes[1].innerHTML = this.checkUndoBufferLength1()
  }

  undoChanges(undoDiff) {
    // console.log('diff ' + undoDiff)
    let editor = atom.workspace.getActiveTextEditor()
    for ( let i = 0; i < undoDiff; i++ ) {
      // console.log("UNDO!")
      editor.undo(i)
    }
  }

  redoChanges(redoDiff) {
    // console.log('diff ' + redoDiff)
    let editor = atom.workspace.getActiveTextEditor()
    for ( let i = 0; i < redoDiff; i++ ) {
      // console.log("REDO!")
      editor.redo(i)
    }
  }

  numberOfChanges(firstNo, nextNo) {
    // console.log("changessss")
    // console.log(parseInt(startVal))
    let initialVal = parseInt(firstNo)
    startVal = nextNo
    // console.log('new startVal: ' + startVal)
    // console.log('changestart: ' + initialVal)
    let finalVal = parseInt(nextNo)
    // console.log('change end: ' + finalVal)
    if (initialVal > finalVal) {
      let undoDiff = (initialVal - finalVal)
      // console.log('undoDiff: ' + undoDiff)
      this.undoChanges(undoDiff);
    } else if (initialVal < finalVal) {
      let redoDiff = (finalVal - initialVal)
      // console.log('redoDiff: ' + redoDiff)
      this.redoChanges(redoDiff);
    } else {
      // console.log("ELSE")
    }
  }

  // these are required for all the functions to run
  serialize() {}

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }

  __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
  }
}
// things here to test
