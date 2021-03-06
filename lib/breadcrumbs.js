'use babel';

// import BreadcrumbsView from './breadcrumbs-view';
import CrumbComments from './crumbComments'
import BottomBarView from './bottomBar-view';
import CommentBtnView from './commentBtn-view';
import RecordBtnView from './recordBtn-view'
import { CompositeDisposable } from 'atom';
import fs from 'fs';
import path from 'path';
import git from 'simple-git';


export default BreadCrumbs = {

  breadcrumbsView: null,
  modalPanel: null,
  subscriptions: null,
  stateVar: this.state,



  activate(state) {

    // var $ = require('jQuery');


    // this.breadcrumbsView = new BreadcrumbsView(state.breadcrumbsViewState);
    this.crumbComments = new CrumbComments
    this.commentBtnView = new CommentBtnView
    this.recordBtnView = new RecordBtnView
    this.bottomBarView = new BottomBarView();
    // console.log(this.bottomBarView.getElement())

    this.bottomPanel = atom.workspace.addBottomPanel({
      item: this.bottomBarView.getElement(),
      className: 'slide-bar-panel',
      visible: true
    });
    // this.bottomPanel.id = 'slide-bar-panel'
    console.log(this.bottomPanel)
    this.commentBtn = atom.workspace.addBottomPanel({
      item: this.commentBtnView.getElement(),
      className: 'comment-btn-panel',
      visible: true
    });
    // this.commentBtn.id = 'comment-btn-panel'
    this.bottomPanel = atom.workspace.addBottomPanel({
      item: this.recordBtnView.getElement(),
      className: 'record-btn-panel',
      visible: true
    });

    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.breadcrumbsView.getElement(),
    //   visible: false
    // });


    // let recordbtn = $('#recordToggleBtn')
    //
    // console.log(this.breadcrumbsView)
    //
    // recordbtn.on('click', function() {
    //   console.log('in the record toggle')
    //   this.recordOn()
    // })


    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:toggle': () => this.toggle()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:changeValue': () => this.changeValue()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:recordOn': () => this.recordOn()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:recordOff': () => this.recordOff()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:undoChanges': () => this.undoChanges()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:redoChanges': () => this.redoChanges()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:checkUndoBufferLength': () => this.checkUndoBufferLength()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:newComment': () => this.newComment()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:checkoutSandbox': () => this.checkoutSandbox()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'breadcrumbs:gitCheckback': () => this.gitCheckback()
    }));
    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'breadcrumbs:changeToCurrentPath': () => this.changeToCurrentPath()
    // }));

    recordings = [];
    branchOnLoad = '';
    if(atom.workspace.getActiveTextEditor() != undefined) {
      branchOnLoad = atom.project.getRepositories()[0].getShortHead()
    }
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.breadcrumbsView.destroy();
  },

  serialize() {
    // return {
    //   breadcrumbsViewState: this.breadcrumbsView.serialize()
    // };
  },

  // changeToCurrentBuffer() {
  //   this.changeOfPaneItem = atom.workspace.observeTextEditors(function (editor) {
  //     console.log('added change to buffer listener' + editor)
  //     editor.onDidChangePath(function() {
  //       console.log('in the path change')
  //     })
  //   })
  // },

  recordOn() {
    console.log("I'm recording");
    // recordings = [];
    this.updateBar();

    this.recWorkspaces = atom.workspace.observeTextEditors(function (editor) {
      let currentRecording = editor.buffer.onWillSave(function () {
        let exposedUndoFilePath = path.join(editor.buffer.file.path + '.crumb')
        let undoFilePath = exposedUndoFilePath.replace(/(\S+\/)([\w+\.]+)/, '$1.$2')
        let json = JSON.stringify(editor.buffer.history.serialize({}))
        fs.writeFile(undoFilePath, json, { flag: 'w' }, function (err) {
          if(err) throw err;
          console.log('it saved!');
        });
      });
      recordings.push(currentRecording);
      let exposedUndoFilePath = path.join(editor.buffer.file.path + '.crumb')
      let undoFilePath = exposedUndoFilePath.replace(/(\S+\/)([\w+\.]+)/, '$1.$2')
      if(fs.existsSync(undoFilePath)) {
        fs.readFile(undoFilePath, function(err, data) {
          if(err) throw err;
          let state = JSON.parse(data);
          if(state != null) {
            editor.buffer.history.deserialize(state)
          }
        })
      }
    });
  },

  recordOff() {
    console.log(recordings)
    for(var recording of recordings) {
      recording.dispose();
    }
    this.recWorkspaces.dispose();
    console.log('record off');
  },

  checkUndoBufferLength() {
    let editor = atom.workspace.getActiveTextEditor()
    if (editor === undefined) {
      return 0
    } else {
      return editor.buffer.history.undoStack.length;
    if (__guard__(__guard__(editor, edit => edit.buffer), buff => buff.history) != null) {
      return editor.buffer.history.undoStack.length
      }
    }
  },

  updateBar() {
    console.log(this.bottomBarView.element)
    this.bottomBarView.element.childNodes[1].innerHTML = this.checkUndoBufferLength()
  },

  changeValue() {
    let slidyBarVal = (document.getElementById('slideybar').value);
    document.getElementById('slideVal').innerHTML = slidyBarVal;
  },

  // checks out sandbox branch using simple-git
  checkoutSandbox() {
    console.log('checking out sanbox...')
    repoPath = this.getCurrentRepoPath();
    if(repoPath !== '') {
      let myGit = git(repoPath);
      console.log('git add ' + atom.workspace.getActiveTextEditor().getPath());
      myGit.add([atom.workspace.getActiveTextEditor().getPath()])
      myGit.commit(['commit to checkout sandbox branch', "droppin' crumbs* * * * *"])
      myGit.checkoutLocalBranch('sandbox');
      this.createGitNotification('sandbox', '\nCommitted '+ branchOnLoad + ' branch.\nHave fun.', repoPath)
    } else {
      this.createNoGitError(repoPath);
    };
  },

  // checks out master branch, and prunes sandbox
  gitCheckback() {
    console.log('checking out ' + branchOnLoad)
    this.updateBar()
    repoPath = this.getCurrentRepoPath();
    if(repoPath !== '') {
      let myGit = git(repoPath);
      myGit.add([atom.workspace.getActiveTextEditor().getPath()])
      myGit.commit(['commit to get back to ' + branchOnLoad + ' branch', "pickin' up the crumbs* * * * * "])
      myGit.checkout(branchOnLoad);
      console.log('git co' + branchOnLoad)
      myGit.deleteLocalBranch('sandbox');
      // myGit.raw(
      //   [
      //     'branch',
      //     '-D',
      //     'sandbox'
      //   ]
      // )
      this.createGitNotification(branchOnLoad, '\nSandbox branch has been pruned.', repoPath)
    } else {
      this.createNoGitError(repoPath);
    };
  },

  // returns repo associated with current textEditor, returns path as a string, or '' if no associated repo
  getCurrentRepoPath() {
    let currentRepoPath = '';
    let projectRepos = atom.project.getRepositories();
    if(projectRepos.length === 1) { return projectRepos[0].getWorkingDirectory() }
    else if(projectRepos.length > 1) {
      let editor = atom.workspace.getActiveTextEditor();
      let editorPath = editor.getPath();
      for(repo of projectRepos) {
        let repoPath = repo.getWorkingDirectory();
        if(editorPath.search(repoPath) >= 0) {
          currentRepoPath += repoPath;
        }
      }
    }
    return currentRepoPath;
  },

  // returns the current branch as a string, given an active text editor
  gitBranchCheck() {
    // repoPath = getCurrentRepoPath();
    // if(currentRepoPath !== ) {
    //
    // }
  },

  // creates a git notification
  createGitNotification(branch, message, path) {
    atom.notifications.addSuccess( 'Git Notification: Now on ' + branch + ' branch', {
      description: 'Current repository path: ' + path,
      detail: branch + ' branch successfully checked out. ' + message,
      dismissable: 'true',
      icon: 'octoface'
    })
  },

    // alerts user if they aren't in a vaild git-tracked repository
  createNoGitError() {
    filePath = atom.workspace.getActiveTextEditor().getPath();
    atom.notifications.addError("Sorry! Couldn't complete git action...", {
      description: 'Please add git and try again...',
      detail: filePath + ' is not a valid git repository!',
      dismissable: 'true'
    })
  },
// some things
//   toggle() {
//   console.log('Breadcrumbs was toggled!');
//   if (this.modalPanel.isVisible()) {
//     this.modalPanel.hide()
//   } else {
//     this.modalPanel.show()
//     console.log(this.bottomBarView)
//     //  console.log(this.breadcrumbsView.element.childNodes[1].max = this.checkUndoBufferLength())
//   }
// },

  // toggle() {
  //   // console.log('Breadcrumbs was toggled!');
  //   // console.log(this.bottomBarView.element.childNodes[2].innerHTML = this.checkUndoBufferLength())
  //   let comments = this.crumbComments.syncRead();
  //   console.log(comments);
  //
  //   this.crumbComments.createCommentForm(comments[4]);
  // },

  // toggle() {
  //   console.log('Breadcrumbs was toggled!');
  //    if (this.modalPanel.isVisible()) {
  //      this.modalPanel.hide()
  //    } else {
  //      this.modalPanel.show()
  //      console.log(this.breadcrumbsView.element.childNodes[1].max = this.checkUndoBufferLength())
  //    }
  // },

  newComment() {
    let comment = this.crumbComments.createCommentForm()
    console.log(comment)
    let commentModal = atom.workspace.addModalPanel({
      item: comment,
      visible: false
    });

    if (commentModal.isVisible()) {
      commentModal.hide()
    } else {
      commentModal.show()
    }
  },


  // toggleCommentModal() {
  //
  // }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
