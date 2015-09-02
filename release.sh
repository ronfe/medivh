#!/bin/bash
cnpm install
bower install
gulp copy-seed1
cnpm start >> font-compress/fontMaterial.jade
gulp font-compress
gulp release
cp template/index/*.html bin/