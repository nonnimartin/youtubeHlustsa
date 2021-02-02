Depends on: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
This package has been added as a submodule, or can be acquired with:
`npm install fluent-ffmpeg`

Depends on installing ffmpeg:
hlustaController.js currently hardcodes ffmpeg location in a Homebrew installation location: /usr/local/Cellar/ffmpeg/3.3/bin/ffmpeg

REMOVING ENDLESSHACK

On server install pytube3 with:

`pip3 install git+https://github.com/nficano/pytube`

Quickstart here: `https://python-pytube.readthedocs.io/en/latest/user/quickstart.html`

Run this on server: `open /Applications/Python\ 3.7/Install\ Certificates.command` -- MAY BE MAC SPECIFIC see --> https://github.com/nficano/pytube/issues/473



- Depends upon endlesshack/youtube-video for deriving google video locations for files from youtube URL, which can be found here: https://github.com/endlesshack/youtube-video 

- One tweak is needed in youtube-video/youtube-video.js on line 4 (as of 6/24/17) of this package for setting the initial URL to which the Youtube ID is appended. Change protocol from http to https in the string. This is required for the package to work in Chrome.
