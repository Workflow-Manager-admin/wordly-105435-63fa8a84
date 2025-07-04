#!/bin/bash
cd /home/kavia/workspace/code-generation/wordly-105435-63fa8a84/word_game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

