#!/bin/bash
cnpm install
bower install
gulp copy-seed1
cnpm start >> font-compress/template/seed1.jade
gulp font-compress
gulp release
