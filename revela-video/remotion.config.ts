import { Config } from "@remotion/cli/config";

// Read assets straight from the site's Revela folder instead of keeping copies
// here, so the video and the case study can't drift apart.
Config.setPublicDir("../public/images/Revela");
