import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/LandingPage.module.css';

const Home: NextPage = () => {
  const router = useRouter();

  const startGame = () => {
    router.push('/lobby');
  };

  return (
    <div className={styles.home}>
      <Head>
        <title>Songguesser</title>
        <div className={styles.logo}></div>
      </Head>
      <div className={styles.main}>
        <div className={styles.content}>
          <h1>
            Softwareprojekt
            <br />
            <span>Songguesser</span>
          </h1>
          <p className={styles.par}>
            Songguesser is an exciting new game that challenges players to guess
            the song that is currently playing. Players can join a room and
            listen to a snippet of a song. They then have to guess the title and
            artist of the song before time runs out.
            <br />
            The game features a real-time chat system that allows players to
            communicate with each other and share their guesses.
            <br />
            The game also keeps track of the players´ scores and displays them
            in a leaderboard.One of the unique features of the game is its
            user-friendly interface. The game is easy to navigate and
            understand, making it accessible to players of all ages.
            <br />
            The game also boasts a visually pleasing design, with colorful
            graphics and animations that add to the overall gaming experience.
            <br />
            So if you´re looking for a fun and engaging game that will put your
            music knowledge to the test, look no further than Songguesser! Join
            a room and start guessing today!
          </p>
        </div>
        <div className={styles.form}>
          <h2>Statistics</h2>

          <button
            className={styles.connectButton}
            onClick={() => {
              startGame();
            }}
          >
            Play
          </button>
        </div>
      </div>
      <footer>
        <div className={styles.footer_container}>
          <div className={styles.footer_content}>
            <div className={styles.hdmi}></div>
            <p>Softwareprojekt des Studiengang Medieninformatik</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
