#!/bin/bash
npm install
bower install
grunt uglify
grunt compass
grunt