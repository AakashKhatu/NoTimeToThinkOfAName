import sys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium import webdriver
import selenium

url = "https: // cataas.com/cat/cute/says/"
tags = """#smartmobilityhack 
@IncubateIND
@heredev
@vorqspace"""


MY_SCREEN_NAME = 'email'
MY_PASSWORD = "ayymacarena"


driver = webdriver.Firefox()
driver.get("https://www.twitter.com")

el = driver.find_element_by_css_selector('button.Button.js-login')
el.click()
el = driver.find_element_by_css_selector("input.email-input")
el.send_keys(MY_SCREEN_NAME)
driver.find_element_by_css_selector(
    ".LoginForm-password > input").send_keys(MY_PASSWORD)
# Submit the form
el.submit()
