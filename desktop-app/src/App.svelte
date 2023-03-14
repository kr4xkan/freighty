<script lang="ts">
    import Router, { type RouteDefinition } from "svelte-spa-router";
    import EditUser from "./routes/FormUser.svelte";
    import FormTrip from "./routes/FormTrip.svelte";
    import FormTruck from "./routes/FormTruck.svelte";
    import Home from "./routes/Home.svelte";
    import Login from "./routes/Login.svelte";
    import Register from "./routes/Register.svelte";
    import Trips from "./routes/Trips.svelte";
    import Trucks from "./routes/Trucks.svelte";
    import Users from "./routes/Users.svelte";
    import Forum from "./routes/Forum.svelte";
    import Post from "./routes/Post.svelte";

    const routes: RouteDefinition = {
        "/": Login,
        "/register": Register,
        "/home": Home,
        "/users": Users,
        "/users/:id": EditUser,
        "/fleet": Trucks,
        "/fleet/:id": FormTruck,
        "/trips": Trips,
        "/trips/:id": FormTrip,
        "/forum": Forum,
        "/forum/:id": Post,
    };
</script>

<Router {routes} />
