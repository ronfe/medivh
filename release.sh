#!/bin/bash
cd ~/medivh
sudo npm install
gulp copy-seed1
sudo npm start >> font-compress/template/seed1.jade
gulp font-compress
gulp release