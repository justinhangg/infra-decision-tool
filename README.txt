Infrastructure Decision Tool
============================

Setup and run:
    npm install
    node index.js

Tools: 1) Subnet Host Checker  2) Compute Environment Selector
AWS reserves 5 IP addresses in every subnet.

Example 1 - Subnet is SUFFICIENT
    VPC CIDR: /16
    Subnet CIDR: /24
    Devices: 200
    Result: consistent; 256 total - 5 reserved = 251 usable; 51 unused IPs.

Example 2 - Subnet is NOT sufficient
    VPC CIDR: /16
    Subnet CIDR: /28
    Devices: 20
    Result: consistent; 16 total - 5 reserved = 11 usable; 9 additional IPs needed.
