function createFileUploader(element, tree, editor){
    var xmlHttp;
    var input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.name = "data";
    input.id = "input-button";
    input.className = "inputfile inputfile-1";
    document.getElementById(element).appendChild(input);

    // append a new element via HTML string
    var el = document.createElement('div');
    var domString = '<label for="input-button"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg> <span>Choose a file&hellip;</span></label>';
    el.innerHTML =  domString;
    document.getElementById(element).appendChild(el.firstChild);
 
    var path = document.createElement("input");
    path.id = "upload-path";
    path.type = "text";
    path.name = "path";
    path.defaultValue = "/";
    document.getElementById(element).appendChild(path);
    var button = document.createElement("button");
    button.innerHTML = 'Upload';
    button.id = "upload-button"  // specify ID to assign style
    document.getElementById(element).appendChild(button);
    var mkdir = document.createElement("button");
    mkdir.innerHTML = 'Make Directory';
    mkdir.id = "mkdir-button"
    document.getElementById(element).appendChild(mkdir);
    var mkfile = document.createElement("button");
    mkfile.innerHTML = 'Make File';
    mkfile.id = "mkfile-button"
    document.getElementById(element).appendChild(mkfile);

    function httpPostProcessRequest(){
      if (xmlHttp.readyState == 4){
        if(xmlHttp.status != 200) alert("ERROR["+xmlHttp.status+"]: "+xmlHttp.responseText);
        else {
          tree.refreshPath(path.value);
        }
      }
    }
    function createPath(p){
      xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = httpPostProcessRequest;
      var formData = new FormData();
      formData.append("path", p);
      xmlHttp.open("PUT", "/edit");
      xmlHttp.send(formData);
    }
    
    mkfile.onclick = function(e){
      if(path.value.indexOf(".") === -1) return;
      createPath(path.value);
      editor.loadUrl(path.value);
    };
    mkdir.onclick = function(e){
      if(path.value.length < 2) return;
      var dir = path.value
      if(dir.indexOf(".") !== -1){
        if(dir.lastIndexOf("/") === 0) return;
        dir = dir.substring(0, dir.lastIndexOf("/"));
      }
      createPath(dir);
    };
    button.onclick = function(e){
      if(input.files.length === 0){
        return;
      }
      xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = httpPostProcessRequest;
      var formData = new FormData();
      formData.append("data", input.files[0], path.value);
      xmlHttp.open("POST", "/edit");
      xmlHttp.send(formData);
    }
    input.onchange = function(e){
      if(input.files.length === 0) return;
      var filename = input.files[0].name;
      var ext = /(?:\.([^.]+))?$/.exec(filename)[1];
      var name = /(.*)\.[^.]+$/.exec(filename)[1];
      if(typeof name !== undefined){
        if(name.length > 8) name = name.substring(0, 8);
        filename = name;
      }
      if(typeof ext !== undefined){
        if(ext === "html") ext = "htm";
        else if(ext === "jpeg") ext = "jpg";
        filename = filename + "." + ext;
      }
      if(path.value === "/" || path.value.lastIndexOf("/") === 0){
        path.value = "/"+filename;
      } else {
        path.value = path.value.substring(0, path.value.lastIndexOf("/")+1)+filename;
      }
    }
  }

  function createTree(element, editor){
    var preview = document.getElementById("preview");
    var treeRoot = document.createElement("div");
    treeRoot.className = "css-treeview";
    document.getElementById(element).appendChild(treeRoot);

    function loadDownload(path){
      document.getElementById('download-frame').src = path+"?download=true";
    }

    function loadPreview(path){
      document.getElementById("editor").style.display = "none";
      preview.style.display = "block";
      preview.innerHTML = '<img src="'+path+'" style="max-width:100%; max-height:100%; margin:auto; display:block;" />';
    }

    function fillFolderMenu(el, path){
      var list = document.createElement("ul");
      el.appendChild(list);
      var action = document.createElement("li");
      list.appendChild(action);
      var isChecked = document.getElementById(path).checked;
      var expnd = document.createElement("li");
      list.appendChild(expnd);
      if(isChecked){
        expnd.innerHTML = "<span>Collapse</span>";
        expnd.onclick = function(e){
          document.getElementById(path).checked = false;
          if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
        };
        var refrsh = document.createElement("li");
        list.appendChild(refrsh);
        refrsh.innerHTML = "<span>Refresh</span>";
        refrsh.onclick = function(e){
          var leaf = document.getElementById(path).parentNode;
          if(leaf.childNodes.length == 3) leaf.removeChild(leaf.childNodes[2]);
          httpGet(leaf, path);
          if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
        };
      } else {
        expnd.innerHTML = "<span>Expand</span>";
        expnd.onclick = function(e){
          document.getElementById(path).checked = true;
          var leaf = document.getElementById(path).parentNode;
          if(leaf.childNodes.length == 3) leaf.removeChild(leaf.childNodes[2]);
          httpGet(leaf, path);
          if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
        };
      }
      var upload = document.createElement("li");
      list.appendChild(upload);
      upload.innerHTML = "<span>Upload</span>";
      upload.onclick = function(e){
        var pathEl = document.getElementById("upload-path");
        if(pathEl){
          var subPath = pathEl.value;
          if(subPath.lastIndexOf("/") < 1) pathEl.value = path+subPath;
          else pathEl.value = path.substring(subPath.lastIndexOf("/"))+subPath;
        }
        if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
      };
      var delFile = document.createElement("li");
      list.appendChild(delFile);
      delFile.innerHTML = "<span>Delete</span>";
      delFile.onclick = function(e){
        httpDelete(path);
        if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
      };
    }

    function fillFileMenu(el, path){
      var list = document.createElement("ul");
      el.appendChild(list);
      var action = document.createElement("li");
      list.appendChild(action);
      if(isTextFile(path)){
        action.innerHTML = "<span>Edit</span>";
        action.onclick = function(e){
          editor.loadUrl(path);
          if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
        };
      } else if(isImageFile(path)){
        action.innerHTML = "<span>Preview</span>";
        action.onclick = function(e){
          loadPreview(path);
          if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
        };
      }
      var download = document.createElement("li");
      list.appendChild(download);
      download.innerHTML = "<span>Download</span>";
      download.onclick = function(e){
        loadDownload(path);
        if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
      };
      var delFile = document.createElement("li");
      list.appendChild(delFile);
      delFile.innerHTML = "<span>Delete</span>";
      delFile.onclick = function(e){
        httpDelete(path);
        if(document.body.getElementsByClassName('contextMenu').length > 0) document.body.removeChild(el);
      };
    }

    function showContextMenu(e, path, isfile){
      var divContext = document.createElement("div");
      var scrollTop = document.body.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
      var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft : document.documentElement.scrollLeft;
      var left = event.clientX + scrollLeft - 1;  // add -1 to be always within element to catch event
      var top = event.clientY + scrollTop - 1;
      divContext.className = 'contextMenu';
      divContext.style.display = 'block';
      divContext.style.left = left + 'px';
      divContext.style.top = top + 'px';
      if(isfile) fillFileMenu(divContext, path);
      else fillFolderMenu(divContext, path);
      document.body.appendChild(divContext);
      divContext.onmouseleave = function(e){
          if(document.body.getElementsByClassName('contextMenu').length > 0){
            document.body.removeChild(divContext);
          }
      };
    }

    function createTreeLeaf(path, name, size){
      var leaf = document.createElement("li");
      leaf.id = (((path == "/")?"":path)+"/"+name).toLowerCase();
      var label = document.createElement("span");
      label.textContent = name.toLowerCase();
      leaf.appendChild(label);
      leaf.onclick = function(e){
        if(isTextFile(leaf.id)){
          editor.loadUrl(leaf.id);
        } else if(isImageFile(leaf.id)){
          loadPreview(leaf.id);
        }
      };
      leaf.oncontextmenu = function(e){
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e, leaf.id, true);
      };
      return leaf;
    }

    function createTreeBranch(path, name, disabled){
      var leaf = document.createElement("li");
      var check = document.createElement("input");
      check.type = "checkbox";
      check.id = (((path == "/")?"":path)+"/"+name).toLowerCase();
      if(typeof disabled !== "undefined" && disabled) check.disabled = "disabled";
      leaf.appendChild(check);
      var label = document.createElement("label");
      label.for = check.id;
      label.textContent = name.toLowerCase();
      leaf.appendChild(label);
      check.onchange = function(e){
        if(check.checked){
          if(leaf.childNodes.length == 3) leaf.removeChild(leaf.childNodes[2]);
          httpGet(leaf, check.id);
        }
      };
      label.onclick = function(e){
        if(!check.checked){
          check.checked = true;
          if(leaf.childNodes.length == 3) leaf.removeChild(leaf.childNodes[2]);
          httpGet(leaf, check.id);
        } else {
          check.checked = false;
        }
      };
      leaf.oncontextmenu = function(e){
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e, check.id, false);
      }
      return leaf;
    }

    function addList(parent, path, items){
      var list = document.createElement("ul");
      parent.appendChild(list);
      var ll = items.length;
      for(var i = 0; i < ll; i++){
        var item = items[i];
        var itemEl;
        if(item.type === "file"){
          itemEl = createTreeLeaf(path, item.name, item.size);
        } else {
          itemEl = createTreeBranch(path, item.name);
        }
        list.appendChild(itemEl);
      }

    }

    function isTextFile(path){
      var ext = /(?:\.([^.]+))?$/.exec(path)[1];
      if(typeof ext !== undefined){
        switch(ext){
          case "txt":
          case "json":
          case "htm":
          case "js":
          case "c":
          case "cpp":
          case "css":
          case "xml":
            return true;
        }
      }
      return false;
    }

    function isImageFile(path){
      var ext = /(?:\.([^.]+))?$/.exec(path)[1];
      if(typeof ext !== undefined){
        switch(ext){
          case "png":
          case "jpg":
          case "gif":
            return true;
        }
      }
      return false;
    }

    this.refreshPath = function(path){
      if(path.lastIndexOf('/') < 1){
        path = '/';
        treeRoot.removeChild(treeRoot.childNodes[0]);
        httpGet(treeRoot, "/");
      } else {
        path = path.substring(0, path.lastIndexOf('/'));
        var leaf = document.getElementById(path).parentNode;
        if(leaf.childNodes.length == 3) leaf.removeChild(leaf.childNodes[2]);
        httpGet(leaf, path);
      }
    };

    function delCb(path){
      return function(){
        if (xmlHttp.readyState == 4){
          if(xmlHttp.status != 200){
            alert("ERROR["+xmlHttp.status+"]: "+xmlHttp.responseText);
          } else {
            if(path.lastIndexOf('/') < 1){
              path = '/';
              treeRoot.removeChild(treeRoot.childNodes[0]);
              httpGet(treeRoot, "/");
            } else {
              path = path.substring(0, path.lastIndexOf('/'));
              var leaf = document.getElementById(path).parentNode;
              if(leaf.childNodes.length == 3) leaf.removeChild(leaf.childNodes[2]);
              httpGet(leaf, path);
            }
          }
        }
      }
    }

    function httpDelete(filename){
      xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = delCb(filename);
      var formData = new FormData();
      formData.append("path", filename);
      xmlHttp.open("DELETE", "/edit");
      xmlHttp.send(formData);
    }

    function getCb(parent, path){
      return function(){
        if (xmlHttp.readyState == 4){
          //clear loading
          if(xmlHttp.status == 200) addList(parent, path, JSON.parse(xmlHttp.responseText));
        }
      }
    }

    function httpGet(parent, path){
      xmlHttp = new XMLHttpRequest(parent, path);
      xmlHttp.onreadystatechange = getCb(parent, path);
      xmlHttp.open("GET", "/list?dir="+path, true);
      xmlHttp.send(null);
      //start loading
    }

    httpGet(treeRoot, "/");
    return this;
  }

  function createEditor(element, file, lang, theme, type){
    function getLangFromFilename(filename){
      var lang = "plain";
      var ext = /(?:\.([^.]+))?$/.exec(filename)[1];
      if(typeof ext !== undefined){
        switch(ext){
          case "txt": lang = "plain"; break;
          case "htm": lang = "html"; break;
          case "js": lang = "javascript"; break;
          case "c": lang = "c_cpp"; break;
          case "cpp": lang = "c_cpp"; break;
          case "json": lang = "plain"; break;
          case "css":
          case "scss":
          case "php":
          case "html":
          case "xml":
            lang = ext;
        }
      }
      return lang;
    }

    if(typeof file === "undefined") file = "/index.htm";

    if(typeof lang === "undefined"){
      lang = getLangFromFilename(file);
    }

    if(typeof theme === "undefined") theme = "textmate";

    if(typeof type === "undefined"){
      type = "text/"+lang;
      if(lang === "c_cpp") type = "text/plain";
    }

    var xmlHttp = null;
    var editor = ace.edit(element);

    //post
    function httpPostProcessRequest(){
      if (xmlHttp.readyState == 4){
        if(xmlHttp.status != 200) alert("ERROR["+xmlHttp.status+"]: "+xmlHttp.responseText);
      }
    }
    function httpPost(filename, data, type){
      xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = httpPostProcessRequest;
      var formData = new FormData();
      formData.append("data", new Blob([data], { type: type }), filename);
      xmlHttp.open("POST", "/edit");
      xmlHttp.send(formData);
    }
    //get
    function httpGetProcessRequest(){
      if (xmlHttp.readyState == 4){
        document.getElementById("preview").style.display = "none";
        document.getElementById("editor").style.display = "block";
        if(xmlHttp.status == 200) editor.setValue(xmlHttp.responseText);
        else editor.setValue("");
        editor.clearSelection();
      }
    }
    function httpGet(theUrl){
        xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = httpGetProcessRequest;
        xmlHttp.open("GET", theUrl, true);
        xmlHttp.send(null);
    }

    if(lang !== "plain") editor.getSession().setMode("ace/mode/"+lang);
    editor.setTheme("ace/theme/"+theme);
    editor.$blockScrolling = Infinity;
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().setTabSize(2);
    editor.setHighlightActiveLine(true);
    editor.setShowPrintMargin(false);
    editor.commands.addCommand({
        name: 'saveCommand',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function(editor) {
          httpPost(file, editor.getValue()+"", type);
        },
        readOnly: false
    });
    editor.commands.addCommand({
        name: 'undoCommand',
        bindKey: {win: 'Ctrl-Z',  mac: 'Command-Z'},
        exec: function(editor) {
          editor.getSession().getUndoManager().undo(false);
        },
        readOnly: false
    });
    editor.commands.addCommand({
        name: 'redoCommand',
        bindKey: {win: 'Ctrl-Shift-Z',  mac: 'Command-Shift-Z'},
        exec: function(editor) {
          editor.getSession().getUndoManager().redo(false);
        },
        readOnly: false
    });
    httpGet(file);
    editor.loadUrl = function(filename){
      file = filename;
      lang = getLangFromFilename(file);
      type = "text/"+lang;
      if(lang !== "plain") editor.getSession().setMode("ace/mode/"+lang);
      httpGet(file);
    }
    return editor;
  }
  function onBodyLoad(){
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { vars[key] = value; });
    var editor = createEditor("editor", vars.file, vars.lang, vars.theme);
    var tree = createTree("tree", editor);
    createFileUploader("uploader", tree, editor);
  };