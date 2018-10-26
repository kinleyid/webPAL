
var decoded = decodeURIComponent(window.location.search);
var pID = decoded.substring(decoded.indexOf('=')+1);
var filename = pID + "PAL";

// Glossary:
// "Tokens" are the little images
// "Canvs" are the canvases

var HEIGHT = screen.availHeight;
var WIDTH = screen.availWidth;
var canvH = Math.round(0.18*HEIGHT);
var canvW = Math.round(0.28*HEIGHT);
var radius;
var nCanvs = 6;// Number of peripheral canvases
var nTokenTypes = 100;
var startTheta = 0; //Math.PI/2;
// NOTE: no elements in nTargs can exceed nCanvs
var masterTrialwise_nTokens = [1,2,3,3,6,8];// Each element is the number of targets to show for a trial
var masterTrialwise_nCanvs = [6,6,6,6,6,8];// Number of places for tokens to appear
var nTokenFrames = 180;
var tokenMs = 3000;
var presentationTime;
var reactionTimes = [];
var nBlanksBetweenTokens = 30;
var interTokenMs = 500;
var nBlanksAfterLastToken = 30;
var postTrialMs = 500;
var nInitialBlankFrames = 60;
var preTrialTextMs = 1000;
var preTrialMs = 1000;
var nInitialTextFrames = 120;
var nFeedbackFrames = 120; 
var feedbackMs = 2000;
var nIncorrectFrames = 120; // Number of frames subject is told they are incorrect and to try again
var filledProb = 0.2;//0.35;//6/9;
var tokenPxlSz = [Math.round(canvH/12),Math.round(canvH/12)]; // Size of token pixels in real pixels [width,height]
var xRange = [2,3,4,5,6,7];
var yRange = [1,2,3,4,5];
var fPropRange = [0.4,0.45,0.5];
var canvasBorderWidth = 3;
var score = 0;
var nColoursPerToken = 2;
var gamify = true;
var practice_nTokens = [1,2];
var practice_nCanvs = [6,6];
var nTries = 3, tryCount;
var stim;
var masterFrameCount = 0;// How many frames there have been
var canvCount = 0;// How many canvases have been shown within a trial
var trialCount = 0;// How many trials there have been
var canvs = [];
var ctxs = [];
var tokens;
var showingOrder;
var testingOrder;
var indicesOfTokens;
var RESPs = [];
var outputText = "Trial,IndicesOfBoxesContainingTokens,OrderBoxesOpened,OrderBoxesTested,SubjectAnswers,TokenJSONS,TokenStyles,ReactionTimes,NewLine,";
var masterCanvIdx;
var nPointsPerCorrect = 50;
var noClicks = true;
var isPractice = true;
var doneAnimating = true;
var masterColours = ['222222',
					 'F3C300',
					 '875692',
					 'F38400',
					 'A1CAF1',
					 'BE0032',
					 'C2B280',
					 '848482',
					 '008856',
					 'E68FAC',
					 '0067A5',
					 'F99379',
					 '604E97',
					 'F6A600',
					 'B3446C',
					 'DCD300',
					 '882D17',
					 '8DB600',
					 '654522',
					 'E25822',
					 '2B3D26'].map(x => "#" + x);;

var masterStyles = [[1,1,1,"both",2],
					[5,5,0.45,"both",1],
					[3,4,0.7,"vertical",2],
					[5,1,0.3,"horizontal",2],
					[2,5,0.1,"both",2],
					[3,3,1,"both",1],
					[4,4,0.2,"both",2],
					[5,5,0.2,"triangles",2],
					[4,4,0.2,"diamond",2],
					[4,4,0.2,"invertdiamond",2],
					[4,4,0.2,"X",1],
					[2,2,0.2,"square",2],
					[5,3,0.2,"T",1],
					[5,5,0.2,"cross",2],
					[4,3,0.2,"both",1]];

function startPractice() {
    tryCount = 0;
    trialCount = 0;
	document.getElementById("instructions").style.display = "none";
	trialwise_nTokens = practice_nTokens;
	trialwise_nCanvs = practice_nCanvs;
    if(trialwise_nCanvs[trialCount]==8){
        radius = Math.round(0.42*HEIGHT);
		startTheta = Math.PI/8;
    } else if(trialwise_nCanvs[trialCount]==6){
        radius = Math.round(0.38*HEIGHT);
        startTheta = Math.PI/2;
    }
    initialize()
	createCanvs()
	hideAll()
    setTimeout(showToken, preTrialMs);
	if(gamify){
		score = 0;
		document.getElementById("score").innerHTML = "Score: " + score;
		document.getElementById("score").style.visibility = "visible";
	}
	removeCanvs();
	document.getElementById("instructions").innerHTML = "<p class='dialog'>That was the end of the practice round.<br/>\
                                                         Click to start the game for real<br/>\
                                                         (Unlike in the practice round, you won't get unlimited retries):</p>\
                                                         <button id='startButton' onclick='startForReal()'>Start game</button>";
	document.getElementById("instructions").style.display = "block";
}

function startForReal() {
	document.getElementById("score").style.visibility = "hidden";
	document.getElementById("instructions").style.display = "none";
	trialwise_nTokens = masterTrialwise_nTokens;
	trialwise_nCanvs = masterTrialwise_nCanvs;
    if(trialwise_nCanvs[trialCount]==8){
        radius = Math.round(0.42*HEIGHT);
		startTheta = Math.PI/8;
    } else if(trialwise_nCanvs[trialCount]==6){
        radius = Math.round(0.38*HEIGHT);
        startTheta = Math.PI/2;
    }
	createCanvs();
	hideAll();
	trialCount = 0;
	score = 0;
    tryCount = 0;
	isPractice = false;
	initialize();
	if (nInitialTextFrames > 0) {
        ctxs[0].fillStyle = "#000000";
        ctxs[0].textAlign="center";
        ctxs[0].font="2vw Verdana";
        ctxs[0].fillText(trialwise_nTokens[trialCount] + " shape" + (trialwise_nTokens[trialCount]>1?"s":"") + " now",canvW/2,canvH/2); 
        ctxs[0].clearRect(0,0,canvW,canvH);
    } else {
        setTimeout(showToken, preTrialMs);
    }
}

function showToken(){
    ctxs[showingOrder[trialCount][canvCount]].clearRect(0,0,canvW,canvH);
    if(tokens[trialCount][showingOrder[trialCount][canvCount]] != null){
        tokens[trialCount][showingOrder[trialCount][canvCount]].draw(ctxs[showingOrder[trialCount][canvCount]]);
    }
    setTimeout(function() {
		ctxs[showingOrder[trialCount][canvCount]].fillStyle = "#000000";
		ctxs[showingOrder[trialCount][canvCount]].fillRect(0,0,canvW,canvH);
		canvCount++;
		if(canvCount == trialwise_nCanvs[trialCount]){
			canvCount = 0;
            setTimeout(testToken, postTrialMs);
		} else {
            setTimeout(showToken, interTokenMs);
		}
	}, tokenMs);
}

function testToken(){
	noClicks = false;
	document.getElementsByTagName("html")[0].style.cursor = "default";
	var canvIdx;
	for(canvIdx = 0; canvIdx < canvs.length; canvIdx++){
		if(canvIdx == 0) {
			canvs[canvIdx].style.cursor = "default";
		} else {
			canvs[canvIdx].style.cursor = "pointer";
		}
	}
	ctxs[0].clearRect(0,0,canvW,canvH);
	tokens[trialCount][testingOrder[trialCount][canvCount]].draw(ctxs[0]);
    presentationTime = performance.now();
}

function evaluateSelection(event){
	if(noClicks){// In case the user accidentally clicks
		return
	}
    reactionTimes.push(event.timeStamp - presentationTime);
	noClicks = true;
	RESPs.push(event.target.Idx); // canvs.indexOf(event.target) instead of Idx?
	animateMiddleCanv(event.target.Idx);
}

function animateMiddleCanv(idx){
	ctxs[0].clearRect(0,0,canvW,canvH);
	var animationRate = 0.8;
	var leftPos = parseInt(canvs[0].style.left);
	var topPos = parseInt(canvs[0].style.top);
	var dL = (parseInt(canvs[idx].style.left) - leftPos);
	var dT = (parseInt(canvs[idx].style.top) - topPos);
	if(Math.abs(dL) < 10 && Math.abs(dT) < 10) { // Reset
		canvs[0].style.left = WIDTH/2 - canvW/2 + "px";
		canvs[0].style.top = HEIGHT/2 - canvH/2 + "px";
		ctxs[0].globalAlpha = 1;
		nextTest();
	} else {
		leftPos += Math.round((1-animationRate)*dL);
		topPos += Math.round((1-animationRate)*dT);
		canvs[0].style.left = leftPos + "px";
		canvs[0].style.top = topPos + "px";
		ctxs[0].globalAlpha *= animationRate;
		tokens[trialCount][testingOrder[trialCount][canvCount]].draw(ctxs[0]);
        setTimeout(function() {
            animateMiddleCanv(idx);
        }, 1000/60);
	}
}

function nextTest(){
	canvCount++;
	if(canvCount == testingOrder[trialCount].length){
		outputText += (isPractice? 0 : trialCount+1) + "," +
					  tokens[trialCount].slice(1).map(x => x!=null?tokens[trialCount].indexOf(x):0).filter(x => x != 0).toString().replace(/,/g,'-') + "," +
					  showingOrder[trialCount].toString().replace(/,/g,'-') + "," +
					  testingOrder[trialCount].toString().replace(/,/g,'-') + "," +
					  RESPs.toString().replace(/,/g,'-') + "," +
                      "~" + tokens[trialCount].map(x => JSON.stringify(x)).join('ISAACSAYSJSONSPLIT') + "~," +
                      "~" + tokens[trialCount].map(x => x==null?"_":x.style).join('-') + "~," +
                      reactionTimes.toString().replace(/,/g,'-') + "," +
                      "NewLine,";
		var tokenIdx, correct = true;
        reactionTimes = []
		for(tokenIdx = 0; tokenIdx < testingOrder[trialCount].length; tokenIdx++){
			if(testingOrder[trialCount][tokenIdx] != RESPs[tokenIdx]){
				correct = false; break;
			}
		}
        if (isPractice && !correct) {
            trialCount--; // Retry
        } else {
            tryCount = correct ? 0 : tryCount + 1;
        }
        if (tryCount < nTries) {
            ctxs[0].fillStyle = "#000000";
            ctxs[0].textAlign="center";
            ctxs[0].font="2vw Verdana";
            ctxs[0].fillText("Try again",canvW/2,canvH/2); 
            canvCount = 0;
            showingOrder[trialCount] = sample(showingOrder[trialCount],1,showingOrder[trialCount].length).map(x=>x[0]);
            testingOrder[trialCount] = sample(testingOrder[trialCount],1,testingOrder[trialCount].length).map(x=>x[0]);
        }
        feedbackScreen();
        setTimeout(nextTrial, feedbackMs);
	} else {
		testToken();
	}
}

function feedbackScreen(){
	var canvIdx, canvColour, tokenIdx, nNewPoints = 0;
	for(canvIdx = 0; canvIdx < canvs.length; canvIdx++){
		ctxs[canvIdx].clearRect(0,0,canvW,canvH);
		if(tokens[trialCount][canvIdx] != null){
			tokens[trialCount][canvIdx].draw(ctxs[canvIdx]);
			tokenIdx = testingOrder[trialCount].indexOf(canvIdx);
			if(testingOrder[trialCount][tokenIdx] == RESPs[tokenIdx]){
				nNewPoints++;
				canvColour = "#00FF00";
			} else canvColour = "#FF0000";
			canvs[canvIdx].style.border = canvasBorderWidth + "px solid " + canvColour;
		}
	}
	document.getElementById("score").style.visibility = "visible";
	var i;
	for(i = 0; i < nNewPoints; i++){
		setTimeout(function(){score += nPointsPerCorrect;
							  document.getElementById("score").innerHTML ="Score: "+score;},
							  Math.floor(nFeedbackFrames*1000/60/8) + 
							  i*Math.floor(nFeedbackFrames*1000/60/20));
	}
}

function nextTrial(){
	trialCount++;
	canvCount = 0;
	RESPs = [];
    if(trialwise_nCanvs[trialCount]==8){
        radius = Math.round(0.42*HEIGHT);
		startTheta = Math.PI/8;
    } else if(trialwise_nCanvs[trialCount]==6){
        radius = Math.round(0.38*HEIGHT);
        startTheta = Math.PI/2;
    }
	removeCanvs();
	createCanvs();
	hideAll()
	document.getElementById("score").style.visibility = "hidden";
    if (isPractice && trialCount == trialwise_nTokens.length) {
        trialCount = 0;
        intermediaryScreen();
    } else if (trialCount == trialwise_nTokens.length || tryCount == nTries) {
        saveData();
    } else {
        if (nInitialTextFrames > 0 && trialwise_nTokens[trialCount-1] && trialwise_nTokens[trialCount] != trialwise_nTokens[trialCount-1] && tryCount == 0) {
            ctxs[0].fillStyle = "#000000";
            ctxs[0].textAlign="center";
            ctxs[0].font="2vw Verdana";
            ctxs[0].fillText(trialwise_nTokens[trialCount] + " shape" + (trialwise_nTokens[trialCount]>1?"s":"") + " now",canvW/2,canvH/2); 
            setTimeout(function() {
                ctxs[0].clearRect(0,0,canvW,canvH);
                setTimeout(showToken, preTrialMs);
            }, preTrialTextMs);
        } else {
            setTimeout(showToken, preTrialMs);
        }
    }
    if(tryCount == nTries){
        tryCount = 0; // Why is this necessary?
    }
}

function removeCanvs() {
	var i;
	for(i = 0; i < canvs.length; i++) {
		document.body.removeChild(canvs[i]);
	}
	canvs = [];
	ctxs = [];
}

function createCanvs(){
	var nCanvs = trialwise_nCanvs[trialCount];
	var canvIdx;
	for(canvIdx = 0; canvIdx <= nCanvs; canvIdx++){
		var canv = document.createElement('canvas');
		canv.Idx = canvIdx;	
		canv.addEventListener("click", evaluateSelection, false);
		canv.addEventListener("touchend", evaluateSelection, false);
		canv.height = canvH;
		canv.width = canvW;
		canv.style.position = "absolute";
		ctx = canv.getContext("2d");
		if(canvIdx == 0){// Middle canvas
			ctx.fillStyle = "#FFFFFF";
			canv.classList.add("testCanv");
			canv.style.left = WIDTH/2 - canvW/2 + "px";
			canv.style.top = HEIGHT/2 - canvH/2 + "px";
		} else {// Peripheral canvases
			ctx.fillStyle = "#000000";
			canv.classList.add("tokenCanv");
			theta = (canvIdx-1)*2*Math.PI/nCanvs+ startTheta;
			canv.style.left = WIDTH/2 + Math.round(radius*Math.cos(theta) - canvW/2) + "px";
			canv.style.top = HEIGHT/2 + Math.round(radius*Math.sin(theta) - canvH/2) + "px";
		}
		document.body.appendChild(canv);
		canvs.push(canv);
		ctxs.push(ctx);
	}
}

function hideAll(){
	// Hide cursor as well
	document.getElementsByTagName("html")[0].style.cursor = "none";
	document.getElementsByTagName("html")[0].focus();
	var i;
	for(i = 0; i < canvs.length; i++){
		canvs[i].style.cursor = "none";
		if(i == 0) { // Middle canvas
			ctxs[i].clearRect(0,0,canvW,canvH);
		} else { // Peripheral canvases
			canvs[i].style.border = canvasBorderWidth + "px solid #000000";
			ctxs[i].fillStyle = "#000000";
			ctxs[i].fillRect(0,0,canvW,canvH);
		}
	}
}

function initialize(){
	tokens = [];
	testingOrder = [];
	showingOrder = [];
	var trialIdx, nCanvs, canvsWithTokens, currTokens, currColours, currStyles, tokenIdx, nColours;
	for(trialIdx = 0; trialIdx < trialwise_nTokens.length; trialIdx++){
		nCanvs = trialwise_nCanvs[trialIdx];
		currTokens = [...Array(1+nCanvs)].fill(null);
		canvsWithTokens = sample([...Array(nCanvs).keys()].map(x => x+1),1,trialwise_nTokens[trialIdx]).map(x => x[0]);
		currStyles = sample(masterStyles,1,trialwise_nTokens[trialIdx]).map(x => x[0]);
		nColours = currStyles.map(x => x[4]);
		currColours = sample(masterColours,nColours,trialwise_nTokens[trialIdx]);
		for(tokenIdx = 0; tokenIdx < trialwise_nTokens[trialIdx]; tokenIdx++){
			currTokens[canvsWithTokens[tokenIdx]] = new token(currColours[tokenIdx],currStyles[tokenIdx]);
		}
		tokens.push(currTokens);
		showingOrder.push(sample([...Array(nCanvs).keys()].map(x => x+1),1,nCanvs).map(x => x[0]));
		testingOrder.push(sample(canvsWithTokens,1,canvsWithTokens.length).map(x => x[0]));
	}
}

function token(cP,style) {
	var colourPalette = cP;
	var xSize = style[0], ySize = style[1], fProp = style[2], symmetry = style[3];
	while(colourPalette.length < 4) colourPalette = colourPalette.concat(sample(colourPalette,1,1)[0]);
	this.subTokens = [...Array(4).keys()].map(x => new subToken(x,colourPalette[x],xSize,ySize,fProp,symmetry));
	this.style = style;
    this.draw = function(ctx) {
		var subTokenIdx, pxlIdx;
		for(subTokenIdx = 0; subTokenIdx < this.subTokens.length; subTokenIdx++){
			currSubToken = this.subTokens[subTokenIdx];
			ctx.fillStyle = currSubToken.colour;
			for(pxlIdx = 0; pxlIdx < xSize*ySize; pxlIdx++){
				if(currSubToken.colouredPixels[pxlIdx]){
					ctx.fillRect(currSubToken.Xs[pxlIdx],currSubToken.Ys[pxlIdx],tokenPxlSz[0],tokenPxlSz[1]);
				}
			}
		}
	}
}

function subToken(Idx,colour,xSize,ySize,filledProp,symmetry){
	this.Xs = [];
	var i;
	for(i = 0; i < xSize; i++) this.Xs = this.Xs.concat([...Array(ySize)].fill(i));
	this.Xs = this.Xs.map(x => canvW/2 + tokenPxlSz[0]*(x + [-xSize,-xSize,0,0][Idx]));
	this.Ys = [...Array(ySize).keys()];
	while(this.Ys.length < xSize*ySize) this.Ys = this.Ys.concat([...Array(ySize).keys()]);
	this.Ys = this.Ys.map(x => canvH/2 + tokenPxlSz[1]*(x + [-ySize,0,-ySize,0][Idx]));
    this.Xs = this.Xs.map(x => Math.round(x));
    this.Ys = this.Ys.map(x => Math.round(x));
	this.colour = colour;
	this.colouredPixels = [...Array(xSize*ySize)].fill(false);
	if(["vertical","horizontal","both"].includes(symmetry)){
		this.colouredPixels = [...Array(Math.ceil(filledProp*xSize*ySize))].fill(true).concat(
							  [...Array(Math.floor((1-filledProp)*xSize*ySize))].fill(false));
		this.colouredPixels = sample(this.colouredPixels,1,this.colouredPixels.length).map(x => x[0]);
		var sub, m, n, newM, newN, i, pxlIdx;
		for(i = 0; i < (symmetry=="both"?2:1); i++){
			for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++) {// Apply symmetry
				if(this.colouredPixels[pxlIdx]){
					symInds = getSymInds(ySize,xSize,pxlIdx,symmetry);
					this.colouredPixels[symInds[0]] = true;
					this.colouredPixels[symInds[1]] = true;
				}
			}
		}
	}
	if(symmetry.includes("triangles")){
		this.colouredPixels = [...Array(xSize*ySize)].fill(false);
		for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++){
			subs = ind2sub(ySize,pxlIdx+1);
			if(subs[0] >= subs[1]){
				this.colouredPixels[pxlIdx] = true;
			}
		}
	}
	if(symmetry.includes("diamond")){
		for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++){
			subs = ind2sub(ySize,pxlIdx+1);
			if(Idx == 0){
				if(subs[0]+subs[1]>ySize) this.colouredPixels[pxlIdx] = true;
			} else if(Idx == 1){
				if(subs[0]<=subs[1]) this.colouredPixels[pxlIdx] = true;
			} else if(Idx == 2){
				if(subs[0]>=subs[1]) this.colouredPixels[pxlIdx] = true;
			} else if(Idx == 3){
				if(subs[0]+subs[1]<=ySize+1) this.colouredPixels[pxlIdx] = true;
			}
		}
	}
	if(symmetry == "invertdiamond"){
		this.colouredPixels = [...Array(xSize*ySize)].fill(true);
		for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++){
			subs = ind2sub(ySize,pxlIdx+1);
			if(Idx == 0){
				if(subs[0]+subs[1]>ySize) this.colouredPixels[pxlIdx] = false;
			} else if(Idx == 1){
				if(subs[0]<=subs[1]) this.colouredPixels[pxlIdx] = false;
			} else if(Idx == 2){
				if(subs[0]>=subs[1]) this.colouredPixels[pxlIdx] = false;
			} else if(Idx == 3){
				if(subs[0]+subs[1]<=ySize+1) this.colouredPixels[pxlIdx] = false;
			}
		}
	}
	if(symmetry.includes("square")){
		IdxSubs = ind2sub(2,Idx+1);
		for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++){
			subs = ind2sub(ySize,pxlIdx+1);
			if((subs[0] == (IdxSubs[0]==1?1:ySize)) || (subs[1] == (IdxSubs[1]==1?1:xSize))){
				this.colouredPixels[pxlIdx] = true;
			}
		}
	}
	if(symmetry.includes("cross")){
		IdxSubs = ind2sub(2,Idx+1);
		for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++){
			subs = ind2sub(ySize,pxlIdx+1);
			if((subs[0] == (IdxSubs[0]==1?ySize:1)) || (subs[1] == (IdxSubs[1]==1?xSize:1))){
				this.colouredPixels[pxlIdx] = true;
			}
		}
	}
	if(symmetry.includes("X")){
		IdxSubs = ind2sub(2,Idx+1);
		for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++){
			subs = ind2sub(ySize,pxlIdx+1);
			if(IdxSubs[0] == IdxSubs[1]){
				if(subs[0] == subs[1]){
					this.colouredPixels[pxlIdx] = true;
				}
			} else {
				if(subs[0] + subs[1] == ySize + 1){
					this.colouredPixels[pxlIdx] = true;
				}
			}
		}
	}
	if(symmetry.includes("T")){
		IdxSubs = ind2sub(2,Idx+1);
		for(pxlIdx = 0; pxlIdx < this.colouredPixels.length; pxlIdx++){
			subs = ind2sub(ySize,pxlIdx+1);
			if(IdxSubs[0] == 1){
				if(subs[0] == ySize) this.colouredPixels[pxlIdx] = true;
			} else {
				if(IdxSubs[1] == 1){
					if(subs[1] == xSize) this.colouredPixels[pxlIdx] = true;
				} else {
					if(subs[1] == 1) this.colouredPixels[pxlIdx] = true;
				}
			}
		}
	}
}
function sample(urInArray,sampleSize,nSamples){
	var inArray = urInArray.slice(0); // Don't alter original array
	var outArray = [], currSample, i, j, idx;
	var sampleSizes = sampleSize.length?sampleSize:[...Array(nSamples)].fill(sampleSize);
	for(i = 0; i < nSamples; i++){
		currSample = [];
		for(j = 0; j < sampleSizes[i]; j++){
			idx = Math.floor(Math.random()*inArray.length);
			currSample.push(inArray.splice(idx,1)[0]);
		}
		outArray.push(currSample);
	}
	return outArray;
}

function sub2ind(dim1,sub){
	return dim1*(sub[1]-1) + sub[0];
}

function ind2sub(dim1,ind){
	return [(ind%dim1==0) ? dim1 : ind%dim1,Math.ceil(ind/dim1)];
}

function getSymInds(dim1,dim2,ind,sym){
	var oriSubs = ind2sub(dim1,ind+1);
	var oriM = oriSubs[0]; var oriN = oriSubs[1];
	var newM = oriSubs[0]; var newN = oriSubs[1];
	if(sym == "vertical" || sym == "both") {
		newM = dim1 + 1 - oriM;
	}
	if(sym == "horizontal" || sym == "both") {
		newN = dim2 + 1 - newN;
	}
	var newInd1 = sub2ind(dim1,[newM,oriN]) - 1;
	var newInd2 = sub2ind(dim1,[oriM,newN]) - 1;
	return [newInd1,newInd2];
}
