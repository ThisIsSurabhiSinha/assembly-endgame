import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { languages } from "./languages"
import { getFarewellText, getRandomWord } from "./utils"
import Confetti from "react-confetti"

/**
 * Assembly: Endgame with:
 * ✅ Guesses left display
 * ✅ Timer functionality
 */

export default function AssemblyEndgame() {
    // State values
    const [currentWord, setCurrentWord] = useState(() => getRandomWord())
    const [guessedLetters, setGuessedLetters] = useState([])
    const [timeLeft, setTimeLeft] = useState(60) // Timer in seconds
    const [timerActive, setTimerActive] = useState(true)

    // Derived values
    const totalGuesses = languages.length - 1
    const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length
    const guessesLeft = totalGuesses - wrongGuessCount
    const isGameWon = currentWord.split("").every(letter => guessedLetters.includes(letter))
    const isGameLost = wrongGuessCount >= totalGuesses || timeLeft === 0
    const isGameOver = isGameWon || isGameLost
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

    // Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    // Timer functionality
    useEffect(() => {
        if (timerActive && !isGameOver) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => Math.max(prevTime - 1, 0))
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timerActive, isGameOver])

    function addGuessedLetter(letter) {
        setGuessedLetters(prevLetters =>
            prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
        )
    }

    function startNewGame() {
        setCurrentWord(getRandomWord())
        setGuessedLetters([])
        setTimeLeft(60) // Reset timer
        setTimerActive(true) // Restart timer
    }

    const languageElements = languages.map((lang, index) => {
        const isLanguageLost = index < wrongGuessCount
        const styles = {
            backgroundColor: lang.backgroundColor,
            color: lang.color
        }
        const className = clsx("chip", isLanguageLost && "lost")
        return (
            <span className={className} style={styles} key={lang.name}>
                {lang.name}
            </span>
        )
    })

    const letterElements = currentWord.split("").map((letter, index) => {
        const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
        const letterClassName = clsx(
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        )
        return (
            <span key={index} className={letterClassName}>
                {shouldRevealLetter ? letter.toUpperCase() : ""}
            </span>
        )
    })

    const keyboardElements = alphabet.split("").map(letter => {
        const isGuessed = guessedLetters.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const className = clsx({
            correct: isCorrect,
            wrong: isWrong
        })

        return (
            <button
                className={className}
                key={letter}
                disabled={isGameOver}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
            >
                {letter.toUpperCase()}
            </button>
        )
    })

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect
    })

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {getFarewellText(languages[wrongGuessCount - 1].name)}
                </p>
            )
        }

        if (isGameWon) {
            return (
                <>
                    <h2>You win!</h2>
                    <p>Well done! 🎉</p>
                </>
            )
        }

        if (isGameLost) {
            return (
                <>
                    <h2>Game over!</h2>
                    <p>You lose! Better start learning Assembly 😭</p>
                    <p>The word was: {currentWord.toUpperCase()}</p>
                </>
            )
        }

        // Display guesses left
        return (
            <p>
                You have {guessesLeft} guess{guessesLeft === 1 ? "" : "es"} left.
            </p>
        )
    }

    return (
        <main>
            {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}
            <header>
                <h1>Assembly: Endgame</h1>
                <p>
                    Guess the word within 8 attempts or 60 seconds to keep the programming world
                    safe from Assembly!
                </p>
                <p className="timer">
                    Time left: {timeLeft} second{timeLeft === 1 ? "" : "s"}
                </p>
            </header>

            <section aria-live="polite" role="status" className={gameStatusClass}>
                {renderGameStatus()}
            </section>

            <section className="language-chips">{languageElements}</section>

            <section className="word">{letterElements}</section>

            <section className="keyboard">{keyboardElements}</section>

            {isGameOver && (
                <button className="new-game" onClick={startNewGame}>
                    New Game
                </button>
            )}
        </main>
    )
}
