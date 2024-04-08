const useState = React.useState;
const useEffect = React.useEffect;
const useCallback = React.useCallback;
const useReducer = React.useReducer;
// helper function for shuffling deck
const getRandomInt = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};
// main app component
function App() {
	// state for tracking uploaded cards (to set Global Ids)
	const [cardsAdded, setCardsAdded] = useState(0);
	// state for tracking the next globalId for cards to-be-added
	const [globalIdCounter, setGlobalIdCounter] = useState(3);
	// state for tracking whether or not the card is flipped
	const [flipped, setFlipped] = useState(false);
	// state for tracking which cards in our deck are "active" status--might possibly be done with useEffect,
	// but these deck[index]/card-dependent states almost certainly would be better managed with React.Context.
	const [activeCards, setActiveCards] = useState([]);
	// state for tracking whether or not the filter is active (we can still activate and deactivate cards, regardless!)
	const [filtered, setFiltered] = useState(false);
	// sister state to the above tracking any cards with "filtered/inactive" status
	const [filteredCards, setFilteredCards] = useState([]);
	// state for tracking the index into our deck, determining which card is displayed.
	const [index, setIndex] = useState(0);
	// state for tracking our master deck (all active/inactive cards)--again we could probably elimiminate the need for three separate arrays
  // if we refactored this to use React.Context
	const [deck, setDeck] = useState(mappedDeck);
	// providing an initial state which we'll set again with useEffect on our Card component's receipt of any card data. 
	// We could have made this an empty object, too, but then our .
	const [activeCard, setActiveCard] = useState({
		front: "sample",
		back: "sample"
	});
	// state for tracking form/menu visibility and text input focus (necessary for disabling hotkey behavior while entering text)
	const [showCardForm, setShowCardForm] = useState(false);
	const [showSaveForm, setShowSaveForm] = useState(false);
	const [inputActive, setInputActive] = useState(false);
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	// key string values for our custom hotkey hook
	const nextKey = ["ArrowRight"];
	const prevKey = ["ArrowLeft"];
	const upKey = ["ArrowUp"];
	const downKey = ["ArrowDown"];
	// Is the filter active? 
  	// If so, 
			// are there any cards in our activeCards array? T/F
	  	// This is only possible in the case of activating the filter with an empty deck--otherwise, it does not allow you to filter all cards
  	// If not,
			// are there any cards in our master deck array? T/F
	const haveCards = filtered
		? activeCards.length > 0
			? true
			: false
		: deck.length > 0
		? true
		: false;
	// any time we update the deck, make sure our Global ID reflects the changes.
	useEffect(() => {
		const snapshot = Array.from(deck);
        if (snapshot.length !== 0) {
			setGlobalIdCounter(snapshot.length);
		} else if (filtered) {
			const count = activeCards.length + filteredCards.length;
			setGlobalIdCounter(count);
		} else if (!filtered && snapshot.length === 0) {
			setGlobalIdCounter(0);
		}
	}, [activeCards.length, filteredCards.length, deck.length]);
	// helper to process options and data from AddCard component callback.
	const getFormData = (options) => {
		switch (options.operation) {
			case "edit":
				var editedDeck = [];
				if (deck.length > 0) {
					editedDeck = Array.from(deck);
					editedDeck.map((item) => {
						if (item.id === options.data.id) {
							return Object.assign(item, options.data);
						} else return item;
					});
				} else {
					editedDeck = [options.data];
				}
				setDeck(editedDeck);
				break;
			case "add":
				const addedDeck = Array.from(deck);
				addedDeck.concat(options.data);
				setDeck((prevDeck) => prevDeck.concat(options.data));
				break;
			default:
				throw new Error(`Unhandled operation: ${options.operation}`);
		}
	};
	// helper function for shuffling the deck
	const shuffleDeck = () => {
		const newDeck = [];
		for (let i = 0; i < deck.length; i++) {
			const rand = Math.floor(Math.random() * (i + 1));
			newDeck[i] = newDeck[rand];
			newDeck[rand] = deck[i];
		}
		setDeck(newDeck);
	};
	// getter for Child text input status 
	// (needed for disabling hotkeys)
	const getChildInputStatus = (status) => {
		setInputActive(status);
	};
	// getter for filter component status--
  // if active, we propagate filtered deck to children..
	const getFilterStatus = (status) => {
		setFiltered(status);
	};
	// with these helper functions!
	const getFilteredCards = (cards) => {
		setFilteredCards(cards);
	};
	const getActiveCards = (cards) => {
		setActiveCards(cards);
	};
	const getUpdatedDeck = (newDeck) => {
		setDeck(newDeck);
	};
	// helper for sending valid Global ID to AddCard component
	const sendNextId = (n) => {
		if (!n) {
			if (deck.length !== 0 && !filtered) {
				const len1 = deck.length;
				setGlobalIdCounter(len1);
			} else if (filtered) {
				const len = activeCards.length + filteredCards.length;
				setGlobalIdCounter(len);
			}
		} else {
			if (n) {
				setGlobalIdCounter(n);
			}
		}
	};
	// helper for loading form data from SaveLoad component
	const loadCallback = (options) => {
		const op = options.operation;
		const data = options.data;
		switch (op) {
			case "add":
				const d = data;
				const old = Array.from(deck);
				const addedCount = d.length;
				const pre = [...old, ...d];
				const addedDeck = pre.map((obj, i) => {
					if (obj.hasOwnProperty("active")) {
						Object.assign(obj, {
							active: obj.active,
							id: i
						});
					} else {
						Object.assign(obj, {
							active: true,
							id: i
						});
					}

					return obj;
				});

				setCardsAdded(addedCount);
				setDeck(addedDeck);
				break;
			case "replace":
				const r = data;
				const replaceCount = r.length;
				const mapped = r.map((obj, i) => {
					Object.assign(obj, {
						active: true,
						id: i
					});

					return obj;
				});
				setCardsAdded(replaceCount);
				setDeck(mapped);
				break;
			default:
				throw new Error(`Unhandled operation: ${options.operation}`);
		}
	};
	
	const nextCard = () => {
		if (index + 1 === deck.length) {
			setIndex(0);
		} else {
			setIndex(index + 1);
		}
	};

	const prevCard = () => {
		const len = filtered ? activeCards.length - 1 : deck.length - 1;
		if (index - 1 >= 0) {
			setIndex(index - 1);
		} else {
			setIndex(len);
		}
	};
	
	const deleteDeck = useCallback(() => {
		setDeck([]);
		setGlobalIdCounter(0);
	}, [deck]);
	
	const handleNext = useCallback(
		(key) => {
			if (!inputActive) {
				setIndex((currentIndex) =>
					currentIndex + 1 === deck.length ? 0 : currentIndex + 1
				);
			}
		},
		[setIndex, deck.length, inputActive]
	);

	const handlePrev = useCallback(
		(key) => {
			const len = filtered ? activeCards.length - 1 : deck.length - 1;
			if (!inputActive) {
				setIndex((currentIndex) => (currentIndex - 1 < 0 ? len : currentIndex - 1));
			}
		},
		[filtered, setIndex, deck.length, inputActive, activeCards.length]
	);
	const handleFlip = useCallback(
		(key) => {
			if (!inputActive) {
				setFlipped((flipped) => !flipped);
			}
		},
		[setFlipped, inputActive]
	);
	useEffect(() => {
		if (!filtered) {
			const unFilteredActiveCard = deck[index];
			if (unFilteredActiveCard) {
				setActiveCard(unFilteredActiveCard);
			} else {
				setActiveCard(deck[0]);
				setIndex(0);
			}
		} else {
			const filteredActiveCard = activeCards[index];
			if (filteredActiveCard) {
				setActiveCard(filteredActiveCard);
			} else {
				setActiveCard(activeCards[0]);
				setIndex(0);
			}
		}
	}, [filtered, index, deck, activeCards]);

	useKeyboardShortcut(nextKey, handleNext);
	useKeyboardShortcut(prevKey, handlePrev);
	useKeyboardShortcut(upKey, handleFlip);
	useKeyboardShortcut(downKey, handleFlip);
	const filterCardsClass = !showFilterMenu
		? "filter__cards__hidden"
		: "filter__cards__show";
	const filterNotification = filtered
		? "filter__active__notification"
		: "filter__inactive__notification";
	return (
		<div style={{ height: "100%", width: "100%", display: "block" }}>
			<div className={filterNotification}>
				<div onClick={() => setFlipped(!flipped)}>
					<Card flipped={flipped} show={haveCards} data={activeCard} />
				</div>
				<div style={divStyle}>
					<button onClick={() => prevCard()} style={prevStyle}>
						Previous Card
					</button>
					<button onClick={() => setFlipped(!flipped)} style={flipStyle}>
						Flip
					</button>
					<button onClick={() => nextCard()} style={nextStyle}>
						Next Card
					</button>
				</div>
				<div className="menu__container">
					<div className="card__menu">
						<button
							onClick={() => setShowCardForm(!showCardForm)}
							style={formButtons}
						>
							{showCardForm ? "Hide" : "Show"} Card Input
						</button>
						<AddCard
							show={showCardForm}
							activeCard={activeCard}
							sendInputStatus={getChildInputStatus}
							sendFormData={getFormData}
							currentId={globalIdCounter}
							getNextId={sendNextId}
							cardsInDeck={
								filtered
									? activeCards.length + filteredCards.length > 0
										? true
										: false
									: deck.length > 0
									? true
									: false
							}
							filterActive={filtered ? true : false}
							totalCards={
								filtered ? activeCards.length + filteredCards.length : deck.length
							}
						/>
					</div>
					<br></br>
					<div className="save__load">
						<button
							onClick={() => setShowSaveForm(!showSaveForm)}
							style={formButtons}
						>
							{showSaveForm ? "Hide" : "Show"} Save/Load Menu
						</button>
						<SaveLoad
							show={showSaveForm}
							sendLoadData={loadCallback}
							sendInputStatus={getChildInputStatus}
							activeDeck={filtered ? activeCards : deck}
						/>
					</div>
					<br></br>
					<div className={filterCardsClass}>
						<button onClick={() => setShowFilterMenu(!showFilterMenu)}>
							{showFilterMenu ? "Hide" : "Show"} Filter Menu
						</button>
						<div>
							<FilterCardsMenu
								sendFilteredCards={getFilteredCards}
								sendActiveCards={getActiveCards}
								show={showFilterMenu}
								sendFilterStatus={getFilterStatus}
								filteredCards={filteredCards}
								activeCards={activeCards}
								deck={deck}
								sendUpdatedDeck={getUpdatedDeck}
							/>
						</div>
					</div>
					
					<div className="shuffle__deck">
						<button
							className="shuffle__deck__button"
							onClick={() => {
								if (window.confirm("Shuffle this deck?")) {
									shuffleDeck();
								}
							}}
						>
							Shuffle Deck
						</button>
					</div>
				</div>
				<div className="delete__deck">
						<button
							className="delete__deck__button"
							onClick={() => {
								if (window.confirm("Do you really want to delete the whole deck?!")) {
									deleteDeck();
								}
							}}
						>
							Delete
						</button>
					</div>
				<div className="filter__status__container">
					<div className={filtered ? "filter__status" : "display-none"}>
						{filtered ? "CARD FILTER ACTIVE" : ""}
					</div>
				</div>
			</div>
		</div>
	);
}
// component for displaying active card info
const Card = (props) => {
    const [data, setData] = useState({ front: "sample", back: "card" })
    useEffect(
        () => {
            setData(props.data)
        },
        [props.data],
    );
    const bracketStart = () => {
        return '{'
    }
    const bracketEnd = () => {
        return '}'
    }
    const footNoteStyle = { fontSize: "11px"}
    const containerStyle = { textAlign: "center", width: "100%", display: "block"}
    const stringStyle = { textAlign: "left", background: "lightgray", width: "50%", display: "inline-block"};
    const stringTemp = () => {
        return (
`[
    {
        "front": "front 0",
        "back": "back 0",
        "active": true
    },
    {
        "front": "front 1",
        "back": "back 1"
    },
    ...,
    {
        "front": "front n",
        "back": "back n"
    }
]`
            )
    }
    const flippedClassList = props.flipped
        ? "card flip"
        : "card";
		const hiddenWhenFlipped = (bool) => bool ? {visibility: "visible"}:{visibility:"hidden"};
    return (
        props.show ? (
            <div className="container">
                <div className={flippedClassList}>
                    <div className={props.flipped ? "front noselect collapse" : "front noselect expand" }>{data ? data.front : ""}</div>
                    <div className={props.flipped ? "back noselect expand" : "back noselect collapse"}>{data ? data.back : ""}</div>
                </div>
            </div>
        ) : (<div className="container" style={{ margin: "10px" }}>Nothing to show!<br></br> Add individual cards using the form, or upload a whole deck!<br></br>
            The load feature takes a <code>.json</code> file containing an array of card objects in the following format <br></br>
            <div style={stringStyle}><pre><code>
            {stringTemp()}
                </code></pre></div><br></br><div style={footNoteStyle}>The "active" property may be specified optionally for filtering purposes. The default value is true.<br></br>
						NOTE: If you copy/paste the above, be sure to remove the <code>'...,'</code>!</div></div>)
    )
}
const placeHolder = `[
  {
    "front":"here's a sample",
    "back":"to get you started"
  },
  {
    "front":"here's another card",
    "back":"for two"
  },
  {
    "and":"this also works",
    "numbers":335,
    "property":"so long as we find",
    "two":"string props, however",
    "if":"there's more than two",
    "then":"we can't guarantee",
    "which":"fields will be included"
  }
]`;
const placeHolderJSON = JSON.parse(placeHolder);
// component for saving and loading decks of cards (and setting load behavior)
function SaveLoad(props, { sendLoadCallback }) {
	const [showSpinner, setShowSpinner] = useState(false);
	const [loadInfo, setLoadInfo] = useState("");
	const [filename, setFilename] = useState("");
	const [loadData, setLoadData] = useState([]);
	const [fileInputKey, setFileInputKey] = useState(Date.now());
	const [action, setAction] = useState("add");
	const [textAreaOptionActive, setTextAreaOptionActive] = useState(true);
	const [textInputIsValid, setTextInputIsValid] = useState(true);
	const [textAreaInputString, setTextAreaInputString] = useState("");
	const [textAreaInputValue, setTextAreaInputValue] = useState([]);
	const [textAreaInputKey, setTextAreaInputKey] = useState(Date.now() + 1);
	const [cardDataFromTextArea, setCardDataFromTextArea] = useState(null);
	const display = props.show ? "display-block" : "display-none";
	const buttonVal =
		action === "add"
			? "Add"
			: action === "replace"
			? "Replace"
			: action === "save"
			? "Save"
			: "";
	const debouncedValidationInput = useDebounce(textAreaInputString, 1000);
	const debouncedLoadInfo = useDebounce(loadInfo, 5000);
	// delay for clearing load messages
	useEffect(() => {
		if (debouncedLoadInfo) {
			setLoadInfo("");
		}
	}, [debouncedLoadInfo]);
	// delay for validating JSON input and retrieving card-like objects
	useEffect(() => {
		console.log("in useEffect for debouncedValidationInput...");
		if (debouncedValidationInput) {
			const results = tryParseJSON(textAreaInputString);
			if (results) {
				if (
					results &&
					!Array.isArray(results) &&
					Object.keys(results).length >= 1
				) {
					const resObj = getStringProps(results);
					if (resObj) {
						setLoadInfo("Found a card! Click 'add' to load!");
						setShowSpinner(false);
						setTextInputIsValid(true);
						setTextAreaInputValue([resObj]);
					} else {
						setLoadInfo("Couldn't find any card-like objects!");
						setShowSpinner(false);
						setTextInputIsValid(false);
						setTextAreaInputValue([]);
					}
				} else if (results && Array.isArray(results) && results.length > 0) {
					const resArr = getStringPropsFromArr(results);
					if (resArr.length > 0) {
						const cardOrCards = resArr.length > 1 ? "cards" : "card";
						const loadInfoString = `Success! ${JSON.stringify(
							resArr.length
						)} ${cardOrCards} found! Click 'add' to load!`;
						setLoadInfo(loadInfoString);
						setShowSpinner(false);
						setTextInputIsValid(true);
						setTextAreaInputValue(resArr);
					} else {
						setLoadInfo("Couldn't find any card-like objects!");
						setShowSpinner(false);
						setTextInputIsValid(false);
						setTextAreaInputValue([]);
					}
				} else {
					setShowSpinner(false);
					setTextInputIsValid(false);
					setLoadInfo("Couldn't find any card-like objects!");
					setTextAreaInputValue([]);
				}
			} else {
				setShowSpinner(false);
				setTextInputIsValid(false);
				setLoadInfo("Couldn't find any card-like objects!");
				setTextAreaInputValue([]);
			}
		} else {
			setShowSpinner(false);
			setTextInputIsValid(false);
			setLoadInfo("");
			setTextAreaInputValue([]);
		}
	}, [debouncedValidationInput]);
	
	const download = (filename, text) => {
		const pom = document.createElement("a");
		pom.setAttribute(
			"href",
			"data:text/plain;charset=utf-8," + encodeURIComponent(text)
		);
		pom.setAttribute("download", filename);
		if (document.createEvent) {
			const event = document.createEvent("MouseEvents");
			event.initEvent("click", true, true);
			pom.dispatchEvent(event);
		} else {
			pom.click();
		}
	};
	const handleDownload = () => {
		const contents = JSON.stringify(props.activeDeck, 2, "\t");
		let fn = "flashcards.json";
		const currentFilename = filename;
		if (currentFilename.trim() !== "") {
			fn = currentFilename + ".json".toString();
		}
		download(fn, contents);
	};
	const handleFile = (e) => {
		const content = e.target.result;
		const json = JSON.parse(content);
		setLoadData(json);
	};
	const handleOptsChange = (e) => {
		const name = e.target.name;
		setAction(name);
	};
	const handleFileNameInputChange = (e) => {
		const value = e.target.value;
		setFilename(value);
	};
	const handleTextAreaInputChange = (e) => {
		const value = e.target.value;
		if (debouncedValidationInput !== value) {
			setShowSpinner(true);
		}
		setTextAreaInputString(value);
	};

	const tryParseJSON = (jsonString) => {
		// if (!json) throw new Error("Not valid JSON!")
		// console.log("got some JSON! "+JSON.stringify(json));
		try {
			const json = JSON.parse(jsonString);

			// Handle non-exception-throwing cases:
			// Neither JSON.parse(false) nor JSON.parse(1234) throw errors, hence the type-checking,
			// but... JSON.parse(null) returns null, and typeof null === "object",
			// so we must check for that, too. Thankfully, null is falsy, so this suffices:
			if (json && typeof json === "object") {
				return json;
			}
		} catch (e) {
			return false;
		}
		return false;
	};
	const textAreaClass = () => {
		if (textAreaOptionActive && action !== "save") {
			if (showSpinner) {
				return "text__area__validating".toString();
			} else if (!showSpinner && textInputIsValid) {
				return "text__area__valid".toString();
			} else if (!showSpinner && !textInputIsValid && loadInfo == "") {
				return "text__area".toString()
			} else if (!showSpinner && !textInputIsValid) {
				return "text__area__invalid".toString();
			}
		} else {
			return "display-none".toString();
		}
	};
	const clearFileInput = (e) => {
		const newDate = Date.now();
		setFileInputKey(newDate);
	};
	const clearTextAreaInput = (e) => {
		const newKey = Date.now() + 1;
		setTextAreaInputString("");
		setTextAreaInputValue([]);
		setTextAreaInputKey(newKey);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		const currentData = textAreaOptionActive
			? textAreaInputValue
				? textAreaInputValue
				: []
			: loadData
			? loadData
			: [];
		console.log("currentData = " + JSON.stringify(currentData));
		if (action !== "save" && currentData.length > 0) {
			const options = {
				operation: action,
				data: currentData
			};
			props.sendLoadData(options);

			clearFileInput();
			clearTextAreaInput();
			setLoadData([]);
		} else if (action === "save") {
			handleDownload();
			setFilename("");
		} else if (action !== "save" && textAreaOptionActive) {
			alert("Check your JSON, or else select a valid file.");
		} else {
			alert("Please select a valid file");
		}
	};
	const handleFileChange = (file) => {
		const fileData = new FileReader();
		fileData.onloadend = handleFile;
		if (file) {
			fileData.readAsText(file);
		}
	};
	const handleFocus = (e) => {};
	const showCheckOrX = (showSpinner, loadInfo) => {
		if (!showSpinner && loadInfo == "Couldn't find any card-like objects!") {
			return <>&#10060;</> } else if (!showSpinner && strings.includes(loadInfo, "Success")) {
			return <>&#9989;</>
		} else {return <></>}
	}
	const labelContents =
		action === "add"
			? "adds loaded cards to the current deck"
			: action === "replace"
			? "replaces the current deck"
			: "save the current deck as a .json file";
	// ultimately unused helper functions and corresponding useEffect hook for conditionally
  // "pretty-printing" textArea content on detection of valid JSON
	// useEffect(() => {
	// 	if (textAreaInputValue) {
	// 		console.log(
	// 			"got change to textAreaInputValue! " + JSON.stringify(textAreaInputValue)
	// 		);
	// 	}
	// }, [textAreaInputValue]);
	// const textAreaPrettyPrint = () => {
	// 	if (textAreaInputValue) {
	// 		if (
	// 			textAreaInputValue &&
	// 			!Array.isArray(textAreaInputValue) &&
	// 			Object.keys(textAreaInputValue).length >= 2
	// 		) {
	// 			if (textAreaInputValue.id) {
	// 				delete textAreaInputValue.id;
	// 			}
	// 			return JSON.stringify(textAreaInputValue, 2, "\t");
	// 		} else if (
	// 			textAreaInputValue &&
	// 			Array.isArray(textAreaInputValue) &&
	// 			textAreaInputValue.length > 0
	// 		) {
	// 			const newArr = textAreaInputValue.map((obj) => {
	// 				if (obj.id) delete obj.id;
	// 				return obj;
	// 			});
	// 			return JSON.stringify(newArr, 2, "\t");
	// 		} else {
	// 			return "";
	// 		}
	// 	} else {
	// 		return "";
	// 	}
	// };
	return (
		<form className={display} onSubmit={handleSubmit}>
			<input
				type="radio"
				name="save"
				checked={action === "save"}
				onChange={handleOptsChange}
			></input>
			<label htmlFor="save">Save</label>
			<input
				type="radio"
				name="add"
				checked={action === "add"}
				onChange={handleOptsChange}
			></input>
			<label htmlFor="load">Load (Add)</label>
			<input
				type="radio"
				name="replace"
				checked={action === "replace"}
				onChange={handleOptsChange}
			></input>
			<label htmlFor="replace">Load (Replace)</label>
			<br></br>

			<label htmlFor="filename" className="save-load-label">
				{labelContents}
			</label>
			<br></br>
			<div className="filename__input__container">
			<input
				type="text"
				name="filename"
				placeholder="Deck name (defaults to 'flashcards')"
				value={filename}
				className={action === "save" ? "filename__input" : "display-none"}
				
				onChange={handleFileNameInputChange}
				autoComplete="off"
				onFocus={() => props.sendInputStatus(true)}
				onBlur={() => props.sendInputStatus(false)}
			></input>
			</div>
			<div className="text__or__file__button__container">
				<button
					onClick={(e) => {
						setTextAreaOptionActive((prev) => !prev);
						e.preventDefault();
					}}
					className={action !== "save" ? "text__or__file__button" : "display-none"}
				>
					{textAreaOptionActive ? "Upload with File" : "Upload with TextArea"}
				</button>
	
			</div>
			<br></br>
			<textarea
				name="text"
				key={textAreaInputKey}
				className={textAreaClass()}
				onChange={handleTextAreaInputChange}
				onFocus={() => props.sendInputStatus(true)}
				onBlur={() => props.sendInputStatus(false)}
			></textarea>
			<br></br>
			<input
				type="file"
				id="uploadDeck"
				key={fileInputKey}
				name="file"
				accept=".json"
				className={
					action !== "save" && !textAreaOptionActive
						? "display-block"
						: "display-none"
				}
				onChange={(e) => {
					if (e.target.files[0]) {
						handleFileChange(e.target.files[0]);
					}
				}}
			></input>
			<div
				className={
					action !== "save" && textAreaOptionActive
						? "validation__msg"
						: "display-none"
				}
			>
				<div className="check__or__x">
								{!showSpinner && loadInfo.includes("Couldn't") ? <>&#10060;</>: !showSpinner && loadInfo.toLowerCase().includes("found") ? <>&#9989;</>: <></>
								}
				</div>
				<div
					className={
						textAreaOptionActive && showSpinner
							? "validating__text__spinner"
							: "display-none"
					}
				>
					<div className="lds-spinner">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
			<div className="validation__txt">
				{showSpinner ? "Validating json..." : loadInfo}
			</div>
			<input type="submit" value={buttonVal} onFocus={handleFocus} />


		</form>
	);
}
// component for selecting cards to be active/filtered from the current rotation
const FilterCardsMenu = (props) => {
	const [deck, setDeck] = useState([]);
	const [activeCards, setActiveCards] = useState([]);
	const [filteredCards, setFilteredCards] = useState([]);
	const [filterActive, setFilterActive] = useState(false);
	useEffect(() => {
		const oldDeck = props.deck;

		setDeck(oldDeck);

		const active = oldDeck.filter((card) => {
			return card.active === true;
		});
		const inActive = oldDeck.filter((card) => {
			return card.active === false;
		});

		setActiveCards(active);
		setFilteredCards(inActive);
	}, [props.deck]);
	const resetFilter = () => {
		const d = props.deck;
		const reset = d.map((obj) => ({ ...obj, active: true }));
		// console.log("deck = "+JSON.stringify(reset));
		setDeck(reset);
		setFilteredCards([]);
		setActiveCards(reset);
	};
	// whenever we re-render, send the Filter status and cards.
	useEffect(() => {
		props.sendFilterStatus(filterActive);
		props.sendFilteredCards(filteredCards);
		props.sendActiveCards(activeCards);
	}, [filteredCards, filterActive, setFilterActive, props, activeCards]);

	const updateActiveCards = (deck) => {
		setDeck(deck);
	};
	const handleChange = (event) => {
		const id = JSON.parse(event.target.name);
		const oD = deck;
		const status = oD.find((item) => {
			return item.id === id;
		}).active;
		const nD = oD.map((item) =>
			item.id === id ? { ...item, active: !status } : item
		);
		const fC = nD.filter((item) => {
			return item.active === false;
		});
		const aC = nD.filter((item) => {
			return item.active === true;
		});
		if (fC.length === nD.length) {
			return alert(
				"It's supposed to be a FILTER, not a WALL--maybe don't select EVERY SINGLE CARD?!"
			);
		}
		setDeck(nD);
		setActiveCards(aC);
		setFilteredCards(fC);
		if (filterActive) {
			props.sendFilteredCards(filteredCards);
			props.sendActiveCards(activeCards);
		}
		props.sendUpdatedDeck(nD);
	};

	const showOrHide = props.show ? "display-block" : "display-none";
	return (
		<div className={showOrHide}>
			<button onClick={() => setFilterActive(!filterActive)}>
				{filterActive ? "Disable Filter" : "Enable Filter"}
			</button>
			<div className="card__select">
				<ul className="active__cards__filter">
					{activeCards.map((card) => (
						<li key={card.id}>
							<input
								name={card.id}
								type="checkbox"
								checked={card.active}
								onChange={handleChange}
							></input>
							<div className="active__card">
								{" "}
								{card.front} / {card.back}, id: {card.id}{" "}
							</div>
						</li>
					))}
				</ul>
				<ul className="inactive__cards__filter">
					{filteredCards.map((card) => (
						<li key={card.id}>
							<input
								name={card.id}
								type="checkbox"
								checked={card.active}
								onChange={handleChange}
							></input>
							<div className="inactive__card">
								{card.front} / {card.back}, id: {card.id}{" "}
							</div>
						</li>
					))}
				</ul>
				<div className="reset__filter__div">
					<button className="reset__filter__button" onClick={resetFilter}>
						Reset Filter<br></br>(activates all cards)
					</button>
				</div>
			</div>
		</div>
	);
};
// form component for adding/editing cards
const AddCard = (props) => {
	const display = props.show ? "display-block" : "display-none";
	const [editOrAdd, setEditOrAdd] = useState("add");
	const [currentId, setCurrentId] = useState(props.currentId);

	const setId = props.filterActive
		? props.totalCards
			? props.totalCards
			: 0
		: props.currentId
		? props.currentId
		: 0;
	const [formState, setFormState] = useState({
		front: "",
		back: "",
		active: true,
		id: setId
	});

	useEffect(() => {
		if (editOrAdd === "add") {
			setFormState({ front: "", back: "", active: true, id: setId });
		}
	}, [setId]);
	const setEditFields = useCallback(() => {
		const card = props.activeCard
			? props.activeCard
			: { front: "", back: "", active: true, id: 0 };
		setFormState({
			front: card.front,
			back: card.back,
			active: card.active,
			id: card.id
		});
	}, [props.activeCard]);
	useEffect(() => {
		if (!props.currentId) {
			setCurrentId(setId);
			setFormState((prev) => ({ ...prev, id: setId }));
		}
	}, [props.currentId, currentId]);
	const getNextId = () => {
		return props.currentId;
	};
	useEffect(() => {
		if (editOrAdd === "add") {
			if (props.filterActive) {
				const tC = props.totalCards;
				setFormState((prev) => ({ ...prev, id: tC }));
			}
		}
	}, [props.filterActive]);
	const setAddFields = useCallback(() => {
		if (props.filterActive) {
			// const filteredIndex = props.totalCards ? props.totalCards:0;
			setFormState({ front: "", back: "", active: true, id: setId });
		} else {
			// const setId = props.currentId ? props.currentId:0;
			setFormState({ front: "", back: "", active: true, id: setId });
		}
	}, [props.currentId, currentId, props.filterActive, props.totalCards, setId]);

	const handleEditOrAddChange = (event) => {
		const name = event.target.name;
		if (props.cardsInDeck) {
			if (name === "edit") {
				setEditFields();
			} else if (name === "add") {
				setAddFields();
			}
			setEditOrAdd(name);
		} else {
			setAddFields();
			setEditOrAdd("add");
		}
	};
	const handleInputChange = (e) => {
		// const name = e.target.name;
		const value = e.target.value;
		const name = e.target.name;
		setFormState((prevState) => ({
			...prevState,
			[name]: value
		}));
	};
	// prevents hotkey events from triggering while text inputs are active
	// otherwise, an L or R arrow key press would cause an edit to fail by changing cards mid-input
	const handleFocus = (e) => {
		const name = e.target.name;
		if (name === "front" || name === "back") {
			props.sendInputStatus(true);
		} else {
			props.sendInputStatus(false);
		}
	};
	useEffect(() => {
		if (props.activeCard && editOrAdd === "edit") {
			setEditFields();
		} else if (!props.activeCard) {
			setEditFields();
		} else if (editOrAdd === "add") {
			setAddFields();
		}
	}, [editOrAdd, props.activeCard, setEditFields]);
	const handleSubmit = (e) => {
		const frontVal = formState.front.trim();
		const backVal = formState.back.trim();
		const op = editOrAdd;
		if (frontVal !== "" && backVal !== "" && frontVal !== backVal) {
			// console.log("formState = "+formState["front"]+", "+formState.back);
			const options = { operation: op, data: formState };
			// if (
			//   options.data.front.trim() !== "" &&
			//   options.data.back.trim() !== "" &&
			//   options.data.front !== options.data.back
			// ) {
			// console.log("options from handleSubmit = " + JSON.stringify(options))
			e.preventDefault();
			props.sendFormData(options);
			if (op === "add") {
				props.getNextId();
				setAddFields();
			}
		} else {
			e.preventDefault();
			alert("pls add a real card");
		}
	};
	const checkValue = editOrAdd === "edit" ? [true, false] : [false, true];
	const buttonVal = editOrAdd.charAt(0).toUpperCase() + editOrAdd.slice(1);
	const allowEdit = props.cardsInDeck ? "" : "noselect";
	const allowEditStyle = props.cardsInDeck
		? { color: "black" }
		: { color: "lightgray", fontStyle: "italic", textDecoration: "line-through" };
	return (
		<div className={display}>
			<form>
				{" "}
				<div style={allowEditStyle} className={allowEdit}>
					<input
						type="radio"
						name="edit"
						checked={checkValue[0]}
						onChange={handleEditOrAddChange}
					/>
					<label htmlFor="edit">Edit</label>
				</div>
				<input
					type="radio"
					name="add"
					checked={checkValue[1]}
					onChange={handleEditOrAddChange}
				/>
				<label htmlFor="add">Add</label>
				<br></br>
				<input
					type="text"
					name="front"
					placeholder="flashcard front"
					value={formState.front}
					onChange={handleInputChange}
					onFocus={handleFocus}
					onBlur={() => props.sendInputStatus(false)}
					autoComplete="off"
				></input>
				<br></br>
				<input
					type="text"
					name="back"
					placeholder="flashcard back"
					value={formState.back}
					onChange={handleInputChange}
					onFocus={handleFocus}
					onBlur={() => props.sendInputStatus(false)}
					autoComplete="off"
				></input>
				<br></br>
				<div className="form__id">
					{buttonVal}ing id: {formState.id}
				</div>
				<input type="button" value={buttonVal} onClick={handleSubmit} />
			</form>
		</div>
	);
};
// custom hook for debouncting json validation from textArea input
const useDebounce = (value, delay) => {
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(
		() => {
			// Set debouncedValue to value (passed in) after the specified delay
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);

			// Return a cleanup function that will be called every time ...
			// ... useEffect is re-called. useEffect will only be re-called ...
			// ... if value changes (see the inputs array below).
			// This is how we prevent debouncedValue from changing if value is ...
			// ... changed within the delay period. Timeout gets cleared and restarted.
			// To put it in context, if the user is typing within our app's ...
			// ... search box, we don't want the debouncedValue to update until ...
			// ... they've stopped typing for more than 500ms.
			return () => {
				clearTimeout(handler);
			};
		},
		// Only re-call effect if value changes
		// You could also add the "delay" var to inputs array if you ...
		// ... need to be able to change that dynamically.
		[value]
	);

	return debouncedValue;
};
// helper function for converting card-like objects into valid cards/returns false otherwise
const getStringProps = (jsonObj) => {
  let card = {
    front: "",
    back: "",
    active: true
  };
  while (card.front === "" && card.back === "") {
    if (jsonObj.hasOwnProperty("active") && typeof jsonObj.active === "boolean") {
      card.active = jsonObj.active
      console.log("card.active = " + JSON.stringify(card.active));

    }
    if (jsonObj.hasOwnProperty("front") && typeof jsonObj.front === "string" && jsonObj.front.trim() !== "") {
      card.front = jsonObj.front.trim()
      console.log("card.front = " + JSON.stringify(card.front));

    }
    if ( jsonObj.hasOwnProperty("back") && typeof jsonObj.back === "string" &&
        jsonObj.back.trim() !== card.front ) {
      card.back = jsonObj.back.trim()
      console.log("card.back = " + JSON.stringify(card.back));
    }
    if (card.front !== "" && card.back !== "" && card.front !== card.back) {
      console.log("got card value: "+ JSON.stringify(card))
      return card
    }
	// if the "front" and "back" properties are not explicitly stated, first we'll check the properties--
	// if there's only one and it's a string value, we'll accept it as a card in the form of {"front": "key", "back": "value"}
	console.log("no explicit \"front\" or \"back\" properties found--checking single property value fallback: " + JSON.stringify(jsonObj));
	if (Object.keys(jsonObj).length === 1 && typeof jsonObj[Object.keys(jsonObj)[0]] === "string" && typeof Object.keys(jsonObj)[0] === "string") {
		let question = Object.keys(jsonObj)[0];
		let answer = jsonObj[Object.keys(jsonObj)[0]];
		if (question.trim() !== "" && answer.trim() !== "" && question.trim() !== answer.trim()) {
			card.front = question.trim();
			card.back = answer.trim();
			return card;
		}
	}
    for (let key in jsonObj) {
      if (jsonObj.hasOwnProperty(key)) {
        const prop = jsonObj[key];
        if (typeof prop === "string" && prop.trim() !== "") {
          if (card.front === "") {
            card.front = prop.trim()
            continue
          } else if (prop.trim() !== card.front) {
            card.back = prop.trim()
            continue
          } else if (prop.trim() === card.front) {
            continue
          } else {
            return false;
          }
        } else {
          continue
        }
      }
    }
    if (card.front === "" || card.back === "") {
      return false;
    }
  }
  if ( card.front !== "" && card.back !== "" && card.front !== card.back){
    return card
  } else { return false }
}
// helper function for getting JSON card values from
const getStringPropsFromArr = (arr) => {
	const deck = [];
	for (let i in arr) {
		let jsonObj = arr[i];
		if (jsonObj !== null && typeof jsonObj === "object") {
			const card =
				Object.keys(jsonObj).length >= 1
					? getStringProps(jsonObj)
					: (console.log("skipped that card"), false);
			if (card && card.front !== "" && card.back !== "") {
				deck.push(card);
			}
		} else {
			console.log("skipped that card");
		}
	}
	/*   console.log(deck);
	 */
	return deck;
};
// targets where we'd like the keyboard shortcuts to be inactive
const blacklistedTargets = ["INPUT", "TEXTAREA"];
//reducer for our custom hotkeys hook
const keysReducer = (state, action) => {
	switch (action.type) {
		case "set-key-down":
			return { ...state, [action.key]: true };
		case "set-key-up":
			return { ...state, [action.key]: false };
		default:
			return state;
	}
};

// custom hook for Keyboard shortcuts/hotkeys
const useKeyboardShortcut = (shortcutKeys, callback) => {
	if (!Array.isArray(shortcutKeys))
		throw new Error(
			"The first parameter to `useKeyboardShortcut` must be an ordered array of `KeyboardEvent.key` strings."
		);

	if (!shortcutKeys.length)
		throw new Error(
			"The first parameter to `useKeyboardShortcut` must contain atleast one `KeyboardEvent.key` string."
		);

	if (!callback || typeof callback !== "function")
		throw new Error(
			"The second parameter to `useKeyboardShortcut` must be a function that will be envoked when the keys are pressed."
		);

	const initalKeyMapping = shortcutKeys.reduce((currentKeys, key) => {
		currentKeys[key.toLowerCase()] = false;
		return currentKeys;
	}, {});

	const [keys, setKeys] = useReducer(keysReducer, initalKeyMapping);

	const keydownListener = useCallback(
		(keydownEvent) => {
			const { key, target, repeat } = keydownEvent;
			const loweredKey = key.toLowerCase();

			if (repeat) return;
			if (blacklistedTargets.includes(target.tagName)) return;
			if (keys[loweredKey] === undefined) return;

			if (keys[loweredKey] === false)
				setKeys({ type: "set-key-down", key: loweredKey });
		},
		[keys]
	);

	const keyupListener = useCallback(
		(keyupEvent) => {
			const { key, target } = keyupEvent;
			const loweredKey = key.toLowerCase();

			if (blacklistedTargets.includes(target.tagName)) return;
			if (keys[loweredKey] === undefined) return;

			if (keys[loweredKey] === true)
				setKeys({ type: "set-key-up", key: loweredKey });
		},
		[keys]
	);

	useEffect(() => {
		if (!Object.values(keys).filter((value) => !value).length) callback(keys);
	}, [callback, keys]);

	useEffect(() => {
		window.addEventListener("keydown", keydownListener, true);
		return () => window.removeEventListener("keydown", keydownListener, true);
	}, [keydownListener]);

	useEffect(() => {
		window.addEventListener("keyup", keyupListener, true);
		return () => window.removeEventListener("keyup", keyupListener, true);
	}, [keyupListener]);
};

// style objects
const nextStyle = {
	marginRight: "5px",
	display: "inline",
	float: "right"
};
const prevStyle = {
	marginLeft: "5px",
	display: "inline",
	float: "left"
};
const flipStyle = {
	display: "inline",
	marginLeft: "-1.75rem"
};
const divStyle = {
	width: "auto",
	textAlign: "center"
};
const formButtons = {
	margin: "0px"
};

const sampleDeck = [
	{ front: "front #1", back: "back #1" },
	{ front: "front #2", back: "back #2" },
	{ front: "front #3", back: "back #3" }
];

var tId = 0;
const mappedDeck = sampleDeck.map((obj) => {
	let newObj = {};
	for (let key in obj) {
		newObj[key] = obj[key];
	}
	newObj.active = true;
	newObj.id = tId;
	tId++;
	return newObj;
});

function toggleInfoDisplay() {
	const menu = document.getElementsByClassName("info__menu")[0];
	menu.classList.toggle("display-none");
	menu.classList.toggle("display-block");
}

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
const rootHandle = document.getElementById("root");
ReactDOM.render(<App />, document.getElementById("root"));
