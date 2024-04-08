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
        if (snapshot !== []) {
            setGlobalIdCounter(snapshot.length);
        } else if (filtered) {
            const count = activeCards.length + filteredCards.length;
            setGlobalIdCounter(count);
        } else if (!filtered && snapshot === []) {
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
            if (deck !== [] && !filtered) {
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
                setIndex((currentIndex) => currentIndex + 1 === deck.length ? 0 : currentIndex + 1
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
                            cardsInDeck={filtered
                                ? activeCards.length + filteredCards.length > 0
                                    ? true
                                    : false
                                : deck.length > 0
                                    ? true
                                    : false}
                            filterActive={filtered ? true : false}
                            totalCards={filtered ? activeCards.length + filteredCards.length : deck.length} />
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
                            activeDeck={filtered ? activeCards : deck} />
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
                                sendUpdatedDeck={getUpdatedDeck} />
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
