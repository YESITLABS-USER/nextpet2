"use client";
import React, { useState, useEffect } from "react";
import BASE_URL from "../../utils/constant";
import axios from "axios";
const TermsConditions = () => {
  const [termsConditions, setTermsConditions] = useState([]);

  useEffect(() => {
    getTermsConditions();
  }, []);

  const getTermsConditions = async () => {
    const response = await axios.get(`${BASE_URL}/api/user-terms-condition`);
    if (response.data.status_code === 200) {
      setTermsConditions(response.data.data);
    }
  };


  return (
    <>
      <div className="terms-privacy-wrap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h1
                dangerouslySetInnerHTML={{ __html: termsConditions?.title }}
              />
            </div>
            <div className="col-lg-12 col-md-6">
              <div className="terms-privacy-in">
                <h2>NextPet</h2>

                <p
                  dangerouslySetInnerHTML={{
                    __html: termsConditions?.description,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default TermsConditions;
