<script lang="ts">
import type { GetLibSig } from "./types";

export let getLibrary: GetLibSig;

if(getLibrary){
  
}else{
  console.error("getLibrary isn't valid!");
}

</script>


<slot />