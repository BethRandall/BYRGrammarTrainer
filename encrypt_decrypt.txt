<!DOCTYPE HTML PUBLIC
"-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
 
<html>
<head>
<script language="javascript" type="text/javascript"> 

 
function OutputHtml(field, string)
{
	var fieldNode = document.getElementById(field);
	var currentSpan = document.getElementById(field+"span");
	if (currentSpan!=null) fieldNode.removeChild(currentSpan);
	currentSpan = document.createElement("span");
	currentSpan.setAttribute("id", field+"span");
	while (string.indexOf("<") > -1)
		{
		if (string.indexOf("<") == 0)
			{
			if (string.indexOf("<br />") == 0)
				{
				var linebreak = document.createElement("br");
				currentSpan.appendChild(linebreak);
				string = string.substring(6);
				}
			else
				{
				var fontEndIndex = string.indexOf(">");
				var fontString = string.substring(0,fontEndIndex);
				var fontElem = document.createElement("font");
				if (fontString.indexOf("red") > -1)
					//fontElem.setAttribute("style", "color: #FFOOOO;");
					fontElem.setAttribute("color", "red");
				else fontElem.setAttribute("color", "blue");
				//else fontElem.setAttribute("style", "color: #0000FF;");
				var restString = string.substring(fontEndIndex+1);
				coloredTextEndIndex = restString.indexOf("<");
				var coloredText = restString.substring(0, coloredTextEndIndex);
				var coloredTextNode = document.createTextNode(coloredText);
				fontElem.appendChild(coloredTextNode);
				currentSpan.appendChild(fontElem);
				var fontElemEndIndex = restString.indexOf(">");
				string = restString.substring(fontElemEndIndex+1);
				}
			}
		else
			{
			var fontStartIndex = string.indexOf("<");
			var uncoloredText = string.substring(0,fontStartIndex);
			var uncoloredTextNode = document.createTextNode(uncoloredText);
			currentSpan.appendChild(uncoloredTextNode);	
			string = string.substring(fontStartIndex);
			}
		}
	var txtNode = document.createTextNode(string);
	currentSpan.appendChild(txtNode);
	fieldNode.appendChild(currentSpan); //doesn't work with textbox
}

//Beginning of encryption code

function Encrypt()
{
	var name = document.getElementById("responseboxA").value;
	var encryptedName = NameEncrypt(name);
	OutputHtml("feedbackA", encryptedName);
}

function NameEncrypt(name)
{
	var encryptedName = "";
	for (var i = 0; i < name.length; i++)
	{
	currentChar = name.charAt(i);
	encryptedCharString = encryptChar(currentChar);
	encryptedName += encryptedCharString + "9";
	}
	return encryptedName;
}
 
function encryptChar(currentChar)
{
	var encryptedCharString = currentChar.charCodeAt();
	encryptedCharString = baseNine(encryptedCharString);
	return encryptedCharString;
}
 
function baseNine(integer)
{
	integer = Number(integer);
	var baseNineCounterpart = "";
	var highestPowerOfNine = HighestPowerOfNine(integer);
	for (var exponent = highestPowerOfNine; exponent >=0; exponent--)
	{
		var currentDivisor = Math.pow(9,exponent);
		baseNineCounterpart += Math.floor(integer/currentDivisor);
		integer = (integer % currentDivisor);
	}
	return baseNineCounterpart;
}
 
function HighestPowerOfNine(integer)
{
	var exponent = 0;
	while (Math.pow(9,exponent) < integer) exponent ++;
	return exponent - 1;
}
 
//End of encryption code

//Beginning of decryption code

function Unencrypt()
{
	var name = document.getElementById("responseboxB").value;
	var unEncryptedName = NameUnEncrypt(name);
	OutputHtml("feedbackB", unEncryptedName);
}

function NameUnEncrypt(name)
{
	var unEncryptedName = "";
	while (name.length > 1)
	{
	var currentCharCodeEndIndex = name.indexOf("9");
	var currentCharCode = name.slice(0,currentCharCodeEndIndex);
	name = name.slice(currentCharCodeEndIndex + 1);
	unencryptedChar = UnEncryptChar(currentCharCode);
	unEncryptedName += unencryptedChar;
	}
	return unEncryptedName;
}
 
function UnEncryptChar(charCode)
{
	var baseTenCharChode = BaseTenFromBaseNine(charCode);
	var unEncryptedChar = String.fromCharCode(baseTenCharChode);
	return unEncryptedChar;
}

function BaseTenFromBaseNine(baseNineInt)
{
	var highestExponent = HighestPowerOfTen(baseNineInt);
	var baseTenInt = 0;
	for (var i = highestExponent; i>=0; i--)
		{
		var currentDivisor = Math.pow(10,i);
		var leftMostDigit = Math.floor(baseNineInt/currentDivisor);
		baseTenInt =  baseTenInt + leftMostDigit*(Math.pow(9,i));
		baseNineInt = (baseNineInt % currentDivisor);
		} 
	return baseTenInt;
}



function HighestPowerOfTen(integer)
{
	var exponent = 0;
	while (Math.pow(10,exponent) <= integer) exponent ++;
	return exponent - 1;
}

//end of decryption code

</script>
</head>
 
<body>
<input type="text" ID="responseboxA" style="font-weight: bold;">
<input type="button" ID="buttonA" value = "Encrypt" onclick="Encrypt()" style="font-weight: bold;"/>
<p ID="feedbackA" style="font-size: x-large; font-weight: bold;"> </p>

<input type="text" ID="responseboxB" style="font-weight: bold;">

<input type="button" ID="buttonB" value = "Decrypt" onClick= "Unencrypt()" style="font-weight: bold;"/>
 <p ID="feedbackB" style="font-size: x-large; font-weight: bold;">  </p>

</body>
</html>

 
 
 
 
 
 
 

