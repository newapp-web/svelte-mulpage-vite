import "../../common/scss/common.scss";
import "../../common/scss/sprite.scss";
import Game from "./App.svelte";

const game = new Game({
	target: document.getElementById("app")
});


export default game;
