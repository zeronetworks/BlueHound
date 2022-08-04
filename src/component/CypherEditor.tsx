import React, { Component } from "react";
import classNames from "classnames";
import * as PropTypes from "prop-types";
import "codemirror/addon/lint/lint";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";
import codemirror from "codemirror";
import { createCypherEditor } from 'cypher-codemirror';

export class CypherEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false
    };
    this.options = {
      lineNumbers: true,
      mode: "cypher",
      theme: "cypher",
      gutters: ["cypher-hints"],
      lineWrapping: true,
      autofocus: true,
      smartIndent: false,
      lineNumberFormatter: this.lineNumberFormatter,
      lint: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete"
      },
      hintOptions: {
        completeSingle: false,
        closeOnUnfocus: false,
        alignWithWord: true,
        async: true
      },
      autoCloseBrackets: {
        explode: ""
      },
      ...(this.props.options || {})
    };
    this.schema = this.props.autoCompleteSchema;
  }

  normalizeLineEndings(str) {
    if (!str) return str;
    return str.replace(/\r\n|\r/g, "\n");
  }

  lineNumberFormatter = line => {
    if (!this.codeMirror || this.codeMirror.lineCount() === 1) {
      return "$";
    } else {
      return line;
    }
  };

  getCodeMirrorInstance() {
    return codemirror;
  }

  componentDidMount() {
    const textareaNode = this.editorReference;
    const { editor, editorSupport } = createCypherEditor(
      textareaNode,
      this.options
    );

    this.codeMirror = editor;
    this.codeMirror.on("change", this.codemirrorValueChanged);
    this.codeMirror.on("focus", () => this.focusChanged(true));
    this.codeMirror.on("blur", () => this.focusChanged(false));
    this.codeMirror.on("scroll", this.scrollChanged);
    this.codeMirror.setValue(this.props.value);
    this.editorSupport = editorSupport;
    this.editorSupport.setSchema(this.schema);

    if (this.props.initialPosition) {
      this.goToPosition(this.props.initialPosition);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      if (this.codeMirror && this.codeMirror.getValue() !== nextProps.value) {
        this.codeMirror.setValue(nextProps.value);
      }
    }
  }

  goToPosition(position) {
    for (let i = 0; i < position.line; i++) {
      this.codeMirror.execCommand("goLineDown");
    }

    for (let i = 0; i <= position.column; i++) {
      this.codeMirror.execCommand("goCharRight");
    }
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  focusChanged = focused => {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  };

  scrollChanged = cm => {
    this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
  };

  codemirrorValueChanged = (doc, change) => {
    if (this.props.onValueChange && change.origin !== "setValue") {
      this.props.onValueChange(doc.getValue(), change);
    }
  };

  render() {
    const editorClassNames = classNames(
      "ReactCodeMirror",
      { "ReactCodeMirror--focused": this.state.isFocused },
      this.props.classNames
    );

    return (
      <div
        className={editorClassNames}
        ref={ref => (this.editorReference = ref)}
      />
    );
  }
}

CypherEditor.propTypes = {
  /** override default options  */
  options: PropTypes.object,
  autoCompleteSchema: PropTypes.object,
  onValueChange: PropTypes.func,
  /** set intial value */
  value: PropTypes.string
};

CypherEditor.defaultProps = {
  options: {
    mode: "cypher",
    theme: "cypher"
  },
  autoCompleteSchema: undefined,
  onValueChange: () => { },
  value: ""
};

export default CypherEditor;