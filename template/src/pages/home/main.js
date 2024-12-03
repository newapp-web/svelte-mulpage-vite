import "../../common/app.css";
import "../../common/scss/common.scss";
import "../../common/scss/sprite.scss";
import Home from "./App.svelte";

const home = new Home({
	target: document.getElementById("app")
});

console.info("game pkg 1.1");

export default home;
